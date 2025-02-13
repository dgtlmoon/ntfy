import { Base64 } from "js-base64";
import beep from "../sounds/beep.mp3";
import juntos from "../sounds/juntos.mp3";
import pristine from "../sounds/pristine.mp3";
import ding from "../sounds/ding.mp3";
import dadum from "../sounds/dadum.mp3";
import pop from "../sounds/pop.mp3";
import popSwoosh from "../sounds/pop-swoosh.mp3";
import config from "./config";
import emojisMapped from "./emojisMapped";

export const tiersUrl = (baseUrl) => `${baseUrl}/v1/tiers`;
export const shortUrl = (url) => url.replaceAll(/https?:\/\//g, "");
export const expandUrl = (url) => [`https://${url}`, `http://${url}`];
export const expandSecureUrl = (url) => `https://${url}`;
export const topicUrl = (baseUrl, topic) => `${baseUrl}/${topic}`;
export const topicUrlWs = (baseUrl, topic) =>
  `${topicUrl(baseUrl, topic)}/ws`.replaceAll("https://", "wss://").replaceAll("http://", "ws://");
export const topicUrlJson = (baseUrl, topic) => `${topicUrl(baseUrl, topic)}/json`;
export const topicUrlJsonPoll = (baseUrl, topic) => `${topicUrlJson(baseUrl, topic)}?poll=1`;
export const topicUrlJsonPollWithSince = (baseUrl, topic, since) => `${topicUrlJson(baseUrl, topic)}?poll=1&since=${since}`;
export const topicUrlAuth = (baseUrl, topic) => `${topicUrl(baseUrl, topic)}/auth`;
export const topicShortUrl = (baseUrl, topic) => shortUrl(topicUrl(baseUrl, topic));
export const webPushUrl = (baseUrl) => `${baseUrl}/v1/webpush`;
export const accountUrl = (baseUrl) => `${baseUrl}/v1/account`;
export const accountPasswordUrl = (baseUrl) => `${baseUrl}/v1/account/password`;
export const accountTokenUrl = (baseUrl) => `${baseUrl}/v1/account/token`;
export const accountSettingsUrl = (baseUrl) => `${baseUrl}/v1/account/settings`;
export const accountSubscriptionUrl = (baseUrl) => `${baseUrl}/v1/account/subscription`;
export const accountReservationUrl = (baseUrl) => `${baseUrl}/v1/account/reservation`;
export const accountReservationSingleUrl = (baseUrl, topic) => `${baseUrl}/v1/account/reservation/${topic}`;
export const accountBillingSubscriptionUrl = (baseUrl) => `${baseUrl}/v1/account/billing/subscription`;
export const accountBillingPortalUrl = (baseUrl) => `${baseUrl}/v1/account/billing/portal`;
export const accountPhoneUrl = (baseUrl) => `${baseUrl}/v1/account/phone`;
export const accountPhoneVerifyUrl = (baseUrl) => `${baseUrl}/v1/account/phone/verify`;

export const validUrl = (url) => url.match(/^https?:\/\/.+/);

export const disallowedTopic = (topic) => config.disallowed_topics.includes(topic);

export const validTopic = (topic) => {
  if (disallowedTopic(topic)) {
    return false;
  }
  return topic.match(/^([-_a-zA-Z0-9]{1,64})$/); // Regex must match Go & Android app!
};

export const topicDisplayName = (subscription) => {
  if (subscription.displayName) {
    return subscription.displayName;
  }
  if (subscription.baseUrl === config.base_url) {
    return subscription.topic;
  }
  return topicShortUrl(subscription.baseUrl, subscription.topic);
};

export const unmatchedTags = (tags) => {
  if (!tags) return [];
  return tags.filter((tag) => !(tag in emojisMapped));
};

export const encodeBase64 = (s) => Base64.encode(s);

export const encodeBase64Url = (s) => Base64.encodeURI(s);

export const bearerAuth = (token) => `Bearer ${token}`;

export const basicAuth = (username, password) => `Basic ${encodeBase64(`${username}:${password}`)}`;

export const withBearerAuth = (headers, token) => ({ ...headers, Authorization: bearerAuth(token) });

export const maybeWithBearerAuth = (headers, token) => {
  if (token) {
    return withBearerAuth(headers, token);
  }
  return headers;
};

export const withBasicAuth = (headers, username, password) => ({ ...headers, Authorization: basicAuth(username, password) });

export const maybeWithAuth = (headers, user) => {
  if (user?.password) {
    return withBasicAuth(headers, user.username, user.password);
  }
  if (user?.token) {
    return withBearerAuth(headers, user.token);
  }
  return headers;
};

export const maybeActionErrors = (notification) => {
  const actionErrors = (notification.actions ?? [])
    .map((action) => action.error)
    .filter((action) => !!action)
    .join("\n");
  if (actionErrors.length === 0) {
    return undefined;
  }
  return actionErrors;
};

export const shuffle = (arr) => {
  const returnArr = [...arr];

  for (let index = returnArr.length - 1; index > 0; index -= 1) {
    const j = Math.floor(Math.random() * (index + 1));
    [returnArr[index], returnArr[j]] = [returnArr[j], returnArr[index]];
  }

  return returnArr;
};

export const splitNoEmpty = (s, delimiter) =>
  s
    .split(delimiter)
    .map((x) => x.trim())
    .filter((x) => x !== "");

/** Non-cryptographic hash function, see https://stackoverflow.com/a/8831937/1440785 */
export const hashCode = (s) => {
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) {
    const char = s.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + char;
    // eslint-disable-next-line no-bitwise
    hash &= hash; // Convert to 32bit integer
  }
  return hash;
};

/**
 * convert `i18n.language` style str (e.g.: `en_US`) to kebab-case (e.g.: `en-US`),
 * which is expected by `<html lang>` and `Intl.DateTimeFormat`
 */
export const getKebabCaseLangStr = (language) => language.replace(/_/g, '-');

export const formatShortDateTime = (timestamp, language) =>
  new Intl.DateTimeFormat(getKebabCaseLangStr(language), {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(timestamp * 1000));

export const formatShortDate = (timestamp, language) =>
  new Intl.DateTimeFormat(getKebabCaseLangStr(language), { dateStyle: "short" }).format(new Date(timestamp * 1000));

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

export const formatNumber = (n) => {
  if (n === 0) {
    return n;
  }
  if (n % 1000 === 0) {
    return `${n / 1000}k`;
  }
  return n.toLocaleString();
};

export const formatPrice = (n) => {
  if (n % 100 === 0) {
    return `$${n / 100}`;
  }
  return `$${(n / 100).toPrecision(2)}`;
};

export const openUrl = (url) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export const sounds = {
  ding: {
    file: ding,
    label: "Ding",
  },
  juntos: {
    file: juntos,
    label: "Juntos",
  },
  pristine: {
    file: pristine,
    label: "Pristine",
  },
  dadum: {
    file: dadum,
    label: "Dadum",
  },
  pop: {
    file: pop,
    label: "Pop",
  },
  "pop-swoosh": {
    file: popSwoosh,
    label: "Pop swoosh",
  },
  beep: {
    file: beep,
    label: "Beep",
  },
};

export const playSound = async (id) => {
  const audio = new Audio(sounds[id].file);
  return audio.play();
};

// From: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// eslint-disable-next-line func-style
export async function* fetchLinesIterator(fileURL, headers) {
  const utf8Decoder = new TextDecoder("utf-8");
  const response = await fetch(fileURL, {
    headers,
  });
  const reader = response.body.getReader();
  let { value: chunk, done: readerDone } = await reader.read();
  chunk = chunk ? utf8Decoder.decode(chunk) : "";

  const re = /\n|\r|\r\n/gm;
  let startIndex = 0;

  for (;;) {
    const result = re.exec(chunk);
    if (!result) {
      if (readerDone) {
        break;
      }
      const remainder = chunk.substr(startIndex);
      // eslint-disable-next-line no-await-in-loop
      ({ value: chunk, done: readerDone } = await reader.read());
      chunk = remainder + (chunk ? utf8Decoder.decode(chunk) : "");
      startIndex = 0;
      re.lastIndex = 0;
      // eslint-disable-next-line no-continue
      continue;
    }
    yield chunk.substring(startIndex, result.index);
    startIndex = re.lastIndex;
  }
  if (startIndex < chunk.length) {
    yield chunk.substr(startIndex); // last line didn't end in a newline char
  }
}

export const randomAlphanumericString = (len) => {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < len; i += 1) {
    // eslint-disable-next-line no-bitwise
    id += alphabet[(Math.random() * alphabet.length) | 0];
  }
  return id;
};

export const urlB64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};
