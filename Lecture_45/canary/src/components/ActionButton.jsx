function ActionButton({ children, enabled, onClick }) {
  return (
    <button
      className="inline-block rounded-full bg-yellow-400 px-2 py-1 text-xs font-semibold tracking-wide text-stone-800 uppercase transition-colors duration-300 hover:bg-yellow-300 focus:bg-yellow-300 focus:ring focus:ring-yellow-300 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-500"
      disabled={!enabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default ActionButton;
