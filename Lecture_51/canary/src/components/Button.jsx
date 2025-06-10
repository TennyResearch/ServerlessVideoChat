function Button({ children, enabled, onClick }) {
  return (
    <button
      className="inline-block rounded-4xl bg-yellow-400 px-4 py-1 font-semibold -tracking-normal text-stone-800 transition-colors duration-300 hover:bg-yellow-300 focus:bg-yellow-300 focus:ring focus:ring-yellow-300 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed"
      disabled={!enabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
