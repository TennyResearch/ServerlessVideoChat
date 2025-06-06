import { useAppState } from "../contexts/AppStateProvider";

function AudioInputSelector() {
  const { audioSource, availableAudioSources, updateAudioSource } =
    useAppState();

  function handleChange(e) {
    const deviceId = e.target.value;
    const deviceInfo = availableAudioSources.filter(
      (d) => d.deviceId === deviceId,
    );
    updateAudioSource(deviceInfo[0]);
  }

  return (
    <div>
      <form>
        <div className="grid w-28 grid-cols-2 gap-0">
          <div className="w-10 px-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
              />
            </svg>
          </div>
          <div className="flex items-center text-nowrap">
            <select
              className="block w-3xs rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              onChange={handleChange}
              defaultValue={audioSource ? audioSource.deviceId : null}
            >
              {availableAudioSources.map((s) => (
                <option value={s.deviceId} key={s.deviceId}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <span className="text-left text-[.8rem] font-bold text-black font-stretch-50%">
            Audio Source
          </span>
        </div>
      </form>
    </div>
  );
}

export default AudioInputSelector;
