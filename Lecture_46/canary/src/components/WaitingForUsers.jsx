function WaitingForUsers() {
  return (
    <>
      <span>Waiting for others to login</span>
      <div className="my-2.5 flex space-x-2">
        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-700 [animation-delay:-0.7s]"></div>
        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-700 [animation-delay:-0.3s]"></div>
        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-700"></div>
      </div>
    </>
  );
}

export default WaitingForUsers;
