import { Router, type IRouter } from "express";

const router: IRouter = Router();

const IBM_IAM_URL = "https://iam.cloud.ibm.com/identity/token";
const WATSONX_URL = process.env.IBM_WATSONX_URL ?? "https://us-south.ml.cloud.ibm.com";
const WATSONX_PROJECT_ID = process.env.IBM_WATSONX_PROJECT_ID ?? "";
const IBM_API_KEY = process.env.IBM_WATSONX_API_KEY ?? "";

interface IamTokenResponse {
  access_token?: string;
  error?: string;
}

async function getIamToken(): Promise<string> {
  const res = await fetch(IBM_IAM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: IBM_API_KEY,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`IBM IAM error: ${res.status}`);
  const data = await res.json() as IamTokenResponse;
  if (!data.access_token) throw new Error("No access_token in IBM IAM response");
  return data.access_token;
}

interface StormData {
  name?: string;
  category?: number;
  intensity?: number;
  pressure?: number;
  lat?: number;
  lng?: number;
  movement?: string;
  classification?: string;
}

interface ClaimData {
  propertyAddress?: string;
  propertyType?: string;
  estimatedValue?: string | number;
  coverageType?: string;
}

interface WindData {
  speed?: number;
  direction?: string;
  isOnshore?: boolean;
}

interface ClaimsRequestBody {
  claimData: ClaimData;
  stormData: StormData | null;
  windData: WindData | null;
}

function buildClaimsPrompt(claimData: ClaimData, stormData: StormData | null, windData: WindData | null): string {
  const storm = stormData
    ? `Active Hurricane: ${stormData.name ?? "Unknown"}, Category ${stormData.category ?? "N/A"}, sustained winds ${stormData.intensity ?? "N/A"} mph, pressure ${stormData.pressure ?? "N/A"} mb, movement: ${stormData.movement ?? "N/A"}.`
    : "No active hurricane. Assessment based on historical Gulf Coast risk.";

  const wind = windData
    ? `Current wind: ${windData.direction ?? ""} at ${windData.speed ?? "?"} km/h, ${windData.isOnshore ? "ONSHORE — storm surge risk elevated" : "offshore — reduced coastal impact"}.`
    : "";

  return `<|system|>
You are an expert hurricane insurance claims analyst specializing in Gulf Coast properties. Provide accurate, structured insurance claim risk assessments based on storm data and property information. Always respond with valid JSON only.
<|user|>
Analyze this insurance claim scenario and return a JSON assessment.

STORM CONDITIONS:
${storm}
${wind}

PROPERTY CLAIM:
- Address: ${claimData.propertyAddress ?? "Unknown"}
- Property Type: ${claimData.propertyType ?? "residential"}
- Estimated Value: $${Number(claimData.estimatedValue ?? 0).toLocaleString()}
- Coverage Type: ${claimData.coverageType ?? "homeowners"}

Return ONLY a valid JSON object with this exact structure:
{
  "riskLevel": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
  "estimatedDamageRange": { "min": number, "max": number },
  "coverageRecommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "immediateActions": ["action 1", "action 2", "action 3"],
  "claimPriority": "EMERGENCY" | "URGENT" | "STANDARD",
  "analysis": "2-3 sentence expert analysis of this specific claim scenario"
}
<|assistant|>`;
}

interface WatsonxResponse {
  results?: Array<{ generated_text?: string }>;
}

interface ClaimAssessment {
  riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  estimatedDamageRange: { min: number; max: number };
  coverageRecommendations: string[];
  immediateActions: string[];
  claimPriority: "EMERGENCY" | "URGENT" | "STANDARD";
  analysis: string;
}

function buildFallbackAssessment(claimData: ClaimData, stormData: StormData | null): ClaimAssessment {
  const value = Number(claimData.estimatedValue ?? 0);
  const category = stormData?.category ?? 0;
  const riskLevel = category >= 4 ? "CRITICAL" : category >= 3 ? "HIGH" : category >= 1 ? "MODERATE" : "LOW";
  const damagePercent = category >= 4 ? 0.65 : category >= 3 ? 0.45 : category >= 1 ? 0.25 : 0.1;

  return {
    riskLevel,
    estimatedDamageRange: {
      min: Math.round(value * damagePercent * 0.6),
      max: Math.round(value * damagePercent),
    },
    coverageRecommendations: [
      "Verify wind damage coverage limits in your policy",
      "Confirm NFIP flood coverage is active — standard homeowners excludes flood",
      "Document all property with photos/video before storm arrival",
    ],
    immediateActions: [
      "Contact your insurer now to open a pre-storm claim file",
      "Secure or move valuables to interior rooms above ground level",
      "Obtain contractor estimates early — post-storm demand causes delays",
    ],
    claimPriority: category >= 3 ? "EMERGENCY" : category >= 1 ? "URGENT" : "STANDARD",
    analysis: `Based on ${stormData ? `Category ${category} Hurricane ${stormData.name}` : "current conditions"} and the ${claimData.propertyType ?? "residential"} property at ${claimData.propertyAddress ?? "the specified location"}, estimated damage exposure is significant. ${claimData.coverageType === "homeowners" ? "Note that standard homeowners policies exclude flood damage — separate NFIP coverage is essential for Gulf Coast properties." : `Your ${claimData.coverageType} coverage should be reviewed for hurricane deductible clauses.`} Immediate documentation and insurer contact are strongly recommended.`,
  };
}

router.post("/watsonx-claims", async (req, res) => {
  const { claimData, stormData, windData } = req.body as ClaimsRequestBody;

  if (!claimData?.propertyAddress || !claimData?.estimatedValue) {
    res.status(400).json({ error: "propertyAddress and estimatedValue are required" });
    return;
  }

  // If no IBM credentials configured, return a rule-based fallback assessment
  if (!IBM_API_KEY || !WATSONX_PROJECT_ID) {
    req.log.info("IBM watsonx credentials not configured — using fallback assessment");
    const assessment = buildFallbackAssessment(claimData, stormData);
    res.json({ assessment, source: "fallback" });
    return;
  }

  try {
    const token = await getIamToken();
    const prompt = buildClaimsPrompt(claimData, stormData, windData);

    const watsonxRes = await fetch(
      `${WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          model_id: "ibm/granite-13b-chat-v2",
          input: prompt,
          parameters: {
            decoding_method: "greedy",
            max_new_tokens: 600,
            min_new_tokens: 50,
            stop_sequences: ["\n\n", "<|user|>"],
          },
          project_id: WATSONX_PROJECT_ID,
        }),
        signal: AbortSignal.timeout(25000),
      }
    );

    if (!watsonxRes.ok) {
      throw new Error(`watsonx API error: ${watsonxRes.status}`);
    }

    const watsonxData = await watsonxRes.json() as WatsonxResponse;
    const generatedText = watsonxData?.results?.[0]?.generated_text ?? "";

    // Parse JSON from model output
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in watsonx response");

    const assessment = JSON.parse(jsonMatch[0]) as ClaimAssessment;
    res.json({ assessment, source: "watsonx" });
  } catch (err) {
    req.log.error({ err }, "watsonx claims error — falling back");
    const assessment = buildFallbackAssessment(claimData, stormData);
    res.json({ assessment, source: "fallback" });
  }
});

export default router;
