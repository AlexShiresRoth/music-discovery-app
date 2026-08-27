const SERVER_SNAPSHOT = {
  isIOS: false,
  isStandalone: false,
};

/** Stable server snapshot — must be the same reference every call. */
export function getDeviceSnapshot() {
  return SERVER_SNAPSHOT;
}
