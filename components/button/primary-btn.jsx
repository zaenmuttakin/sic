import Image from "next/image";

export default function PrimaryBtn({
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
      className={`${style} a-middle px-4 py-2.5 font-medium text-white bg-[#7A6DFF] rounded-2xl hover:bg-[#6A5BFF] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed duration-150`}
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
      {icon}
      <p>{label}</p>
    </button>
  );
}
