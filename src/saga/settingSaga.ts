import { call, put } from 'redux-saga/effects';
import { navigate } from 'redux/pageSlice';
import { updateChatSetting, updateModelList } from 'redux/settingSlice';
import { PageType, SettingConfig, SettingStatus } from 'redux/type.d';

async function fetchModelList(url: string, apiKey: string) {
  try {
    const baseURL = (url || '').replace(/\/+$/, '');
    const response = await fetch(`${baseURL}/v1/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/Hayden2018/dialogcraft',
        'X-Title': 'DialogCraft',
      },
    });

    if (!response.ok) throw Error('Unauthorized');

    const { data } = await response.json();
    const availableModels = data
      .map((model: any) => model.id)
      .filter((modelId: string) => typeof modelId === 'string' && modelId.length > 0)
      .sort((a: string, b: string) => a.localeCompare(b));

    return { error: false, data: availableModels };
  } catch (error) {
    return { error: true, data: null };
  }
}

// OpenRouter-specific key check (GET /v1/key, a.k.a. getCurrentKeyMetadata).
// Returns 200 + key metadata for a valid key, 401/403 for an invalid one, at
// zero token cost. Base URLs that don't implement this endpoint report
// supported: false so callers can fall back to a real completion probe.
async function fetchKeyInfo(url: string, apiKey: string): Promise<{ supported: boolean; valid: boolean }> {
  try {
    const baseURL = (url || '').replace(/\/+$/, '');
    const response = await fetch(`${baseURL}/v1/key`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/Hayden2018/dialogcraft',
        'X-Title': 'DialogCraft',
      },
    });

    if (response.status === 401 || response.status === 403) {
      return { supported: true, valid: false };
    }

    if (response.ok) {
      const data = await response.json();
      if (data?.error) return { supported: true, valid: false };
      return { supported: true, valid: true };
    }

    // 404 / 405 / any other status: endpoint not implemented by this base URL.
    return { supported: false, valid: false };
  } catch {
    return { supported: false, valid: false };
  }
}

// Requests a single token from a cheap model. This is the real "can this key
// actually generate?" check and works on any OpenAI-compatible endpoint. Uses
// whatever model is first in the /v1/models list, since a proxy may not carry
// any particular hard-coded model slug.
async function verifyWithOneToken(url: string, apiKey: string, availableModels: Array<string>) {
  const baseURL = (url || '').replace(/\/+$/, '');
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://github.com/Hayden2018/dialogcraft',
    'X-Title': 'DialogCraft',
  };

  // Try the models in listed order; the first one is the primary candidate.
  for (const model of availableModels) {
    try {
      const response = await fetch(`${baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      // Some proxies return 200 with an error object in the body.
      if (data?.error) continue;
      if (Array.isArray(data?.choices) && data.choices.length > 0) {
        return true;
      }
    } catch {
      // try next candidate
    }
  }

  return false;
}

export function* handleGlobalSettingUpdate({ payload }: { payload: SettingConfig; type: string }) {
  yield put(
    updateChatSetting({
      settingId: 'global',
      setting: { status: SettingStatus.VERIFYING },
    })
  );

  const { baseURL, apiKey } = payload;

  // 1. Fetch the model list (also needed for the model picker).
  const { error, data } = yield call(fetchModelList, baseURL!, apiKey!);

  if (error) {
    yield put(
      updateChatSetting({
        settingId: 'global',
        setting: { status: SettingStatus.ERROR },
      })
    );
    return;
  }

  // 2. Verify the key.
  //    a. Prefer the zero-cost OpenRouter /v1/key endpoint when available.
  const { supported, valid } = yield call(fetchKeyInfo, baseURL!, apiKey!);
  let keyValid = supported ? valid : false;

  //    b. Otherwise fall back to checking with 1-token completion.
  if (!supported) {
    const probeValid: boolean = yield call(verifyWithOneToken, baseURL!, apiKey!, data);
    keyValid = probeValid;
  }

  if (!keyValid) {
    yield put(
      updateChatSetting({
        settingId: 'global',
        setting: { status: SettingStatus.ERROR },
      })
    );
    return;
  }

  yield put(
    updateChatSetting({
      settingId: 'global',
      setting: {
        ...payload,
        status: SettingStatus.OK,
      },
    })
  );

  yield put(updateModelList(data));
  yield put(navigate({ to: PageType.CHAT }));
}
