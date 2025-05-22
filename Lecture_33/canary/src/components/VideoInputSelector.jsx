import { useAppState } from "../contexts/AppStateProvider";

function VideoInputSelector() {
  const { videoSource, availableVideoSources, updateVideoSource } =
    useAppState();

  function handleChange(e) {
    const deviceId = e.target.value;
    const deviceInfo = availableVideoSources.filter(
      (d) => d.deviceId === deviceId,
    );
    updateVideoSource(deviceInfo[0]);
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
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
          <div className="flex items-center text-nowrap">
            <select
              className="block w-3xs rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              onChange={handleChange}
              defaultValue={videoSource ? videoSource.deviceId : null}
            >
              {availableVideoSources.map((s) => (
                <option value={s.deviceId} key={s.deviceId}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <span className="text-left text-[.8rem] font-bold text-black font-stretch-50%">
            Video Source
          </span>
        </div>
      </form>
    </div>
  );
}

export default VideoInputSelector;
