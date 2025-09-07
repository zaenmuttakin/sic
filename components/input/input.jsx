export default function Inputz({ style, ...props }) {
  return (
    <input
      {...props}
      className={`${style} block w-full rounded-xl px-4 py-2.5 outline-0 border border-gray-300 disabled:opacity-50 disabled:bg-gray-100`}
    ></input>
  );
}
