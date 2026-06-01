import { DEFAULT_MODEL } from './_prompt-data.js';

const FALLBACK_MODELS = [
  DEFAULT_MODEL,
  'claude-3-5-sonnet-20241022',
  'claude-3-haiku-20240307',
];

export async function callAnthropicMessages(apiKey, body) {
  const modelQueue = uniqueModels([
    process.env.ANTHROPIC_MODEL,
    body.model,
    ...FALLBACK_MODELS,
  ]);

  let lastResult = null;

  for (const model of modelQueue) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ ...body, model }),
    });

    const data = await response.json().catch(() => ({}));
    lastResult = { response, data, model };

    if (response.ok || !isModelAccessError(response, data)) {
      return lastResult;
    }
  }

  return lastResult;
}

function uniqueModels(models) {
  return models
    .filter(model => typeof model === 'string' && model.trim())
    .map(model => model.trim())
    .filter((model, index, all) => all.indexOf(model) === index);
}

function isModelAccessError(response, data) {
  const message = String(data?.error?.message || data?.message || '');
  const type = String(data?.error?.type || data?.type || '');
  return response.status === 404 || /model/i.test(message) || /model/i.test(type);
}
