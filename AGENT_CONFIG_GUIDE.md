# TideGuard AI Agent Configuration Guide

## Overview
The `agent-system-prompt.ts` file contains the system instructions for your ContentIQ/IBM watsonx AI agent. This defines **how** the agent behaves, **what** it sounds like, and **when** it should respond.

## Where to Use This Prompt

### Option 1: ContentIQ Web Interface (Easiest)
1. Go to your ContentIQ/Symplistic dashboard
2. Find your chat deployment (ID: `83e6c4e9-5428-474a-88f2-ca533af9eb4f`)
3. Look for **"System Prompt"** or **"Agent Instructions"** section
4. Copy the entire `AGENT_SYSTEM_PROMPT` text from `agent-system-prompt.ts`
5. Paste it into the system prompt field
6. Save/Deploy

### Option 2: IBM watsonx Studio
1. Open your watsonx agent/skill configuration
2. Navigate to **"Instructions"** or **"Behavior"** tab
3. Replace or append the system prompt with the TideGuard prompt
4. Save the configuration
5. Redeploy the agent

### Option 3: API Configuration
If you're deploying via API, include this in your agent config:

```json
{
  "agent": {
    "name": "TideGuard",
    "description": "Red tide predictive analyst for Southwest Florida",
    "systemPrompt": "[PASTE ENTIRE PROMPT HERE]",
    "knowledge_base": "[red-tide-knowledge-base.ts content]",
    "model": "watsonx",
    "temperature": 0.3,
    "max_tokens": 300
  }
}
```

## What This Prompt Does

### Enforces Concise Responses
- Max 4-5 sentences without a break
- 2-3 sentences for simple answers
- Uses bullets for complex info

### Makes It Sound Like a Predictor
- Leads with data: "Based on current conditions..."
- References ML patterns: "Peak bloom months are August, October, November"
- Uses spatial hotspots: "Lido Key is a historical hotspot"
- Includes confidence levels: "High confidence" / "Moderate uncertainty"

### Keeps It Human
- Avoids database-speak ("According to sources...")
- Uses natural language and conversational tone
- Sounds like a marine science consultant, not a textbook
- Connects data to real actions people take

### Provides Actionable Advice
- Always answers "What should I do?" not just "What is it?"
- Tailored to restaurant/hospitality context
- Includes specific mitigations (HVAC, seating, messaging)
- Acknowledges uncertainty rather than overstating

## Key Behaviors Built In

| Behavior | Example |
|----------|---------|
| **Concise** | ✅ "Wind shifted onshore today. With October approaching and current bloom absent, risk rises to MODERATE starting next week." |
| **Predictive** | ✅ "Historical data shows Tarpon Bay is a hotspot. If offshore bloom drifts inshore, we'll see respiratory cases there first." |
| **Human** | ✅ "Brief your outdoor staff on red tide symptoms—cough, irritation. Anyone with asthma should rotate indoors." |
| **Actionable** | ✅ "Change your HVAC filters today. Set a weekly FWC check on your calendar starting September 28." |

## Customization Tips

### If you want different tone:
- More technical: Add "Use scientific terminology freely"
- More casual: Add "Use conversational, friendly language"
- More data-heavy: Change "Concise" to "Detailed with tables"

### If you want different audience:
- For fishermen: Add "Focus on catch quality, no-fish-kill zones, timing"
- For tourists: Add "Emphasize beach safety, health warnings"
- For policymakers: Add "Include economic impact data and mitigation ROI"

### If you want to add constraints:
- Add: "Only discuss red tide topics. Decline other questions politely."
- Add: "Prioritize restaurant business impacts over marine biology details"
- Add: "Reference the knowledge base for all claims"

## Knowledge Base Integration

The prompt assumes the agent has access to:
1. **13 SCCF & WUSF articles** (from `red-tide-knowledge-base.ts`)
2. **ML predictive model** (2007-2023 historical data)
3. **Live data** (FWC bloom level, wind direction/speed)

Make sure these are added to your ContentIQ knowledge base before deploying the agent.

## Testing the Agent

### Test Prompt 1: Quick Question
**Input**: "Is red tide happening right now?"
**Expected**: 1-2 sentence answer with current condition + risk level

### Test Prompt 2: Predictive
**Input**: "What should I worry about in October?"
**Expected**: References peak season + spatial hotspots + what to prepare for

### Test Prompt 3: Article Analysis
**Input**: "I just read about human activity fueling red tide. Should I be concerned?"
**Expected**: Synthesizes article + current conditions + actionable advice (not just reciting the article)

### Test Prompt 4: Complex Decision
**Input**: "We're planning outdoor renovations next month. Should we worry about red tide?"
**Expected**: Risk assessment for October + business impact + recommendations

## Response Quality Checklist

After deploying, verify the agent:
- [ ] Responds in 2-5 sentences (not paragraphs)
- [ ] Leads with data/prediction, not background
- [ ] Always includes "What to do" not just "What is"
- [ ] States confidence level
- [ ] Sounds like a consultant, not a database
- [ ] Doesn't list raw article facts
- [ ] Connects to current conditions (bloom level + wind)
- [ ] Uses spatial/temporal patterns from ML data

## File Location
```
Aesthetic-Vision/artifacts/tideguard/src/lib/agent-system-prompt.ts
```

## Questions?
If the agent's responses are too verbose:
- Lower `temperature` in API config (more consistent, less creative)
- Add "Keep responses under 100 words" to the prompt
- Split complex questions with: "Let me break that into two parts..."

If it's not making predictions:
- Ensure `red-tide-knowledge-base.ts` is in the knowledge base
- Add: "Use historical bloom patterns and seasonal data to predict future conditions"
- Test with: "What was the worst red tide month historically? What patterns should I expect?"
