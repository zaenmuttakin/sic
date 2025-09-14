import Image from "next/image";

export default function GrayBtn({
  label,
  style,
  image = false,
  icon = false,
  imgsrc,
  ...props
}) {
  return (
    <button
      {...props}
      className={`${style} a-middle px-4 py-2.5 font-medium text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 cursor-pointer`}
    >
      {image && (
        <Image
          src={imgsrc}
          alt="icon"
          width={20}
          height={20}
          className="inline mr-2.5"
        />
      )}
      <p>{label}</p>
    </button>
  );
}
