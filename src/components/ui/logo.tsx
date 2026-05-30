import Image from "next/image";

const SIZES = {
  sm: { px: 30, box: "h-[30px] w-[30px]", text: "text-[19px]" },
  footer: { px: 34, box: "h-[34px] w-[34px]", text: "text-[21px]" },
  md: { px: 34, box: "h-[34px] w-[34px]", text: "text-[23px]" },
  lg: { px: 40, box: "h-[40px] w-[40px]", text: "text-[26px]" },
} as const;

export function Logo({
  size = "md",
  light = false,
  showText = true,
}: {
  size?: keyof typeof SIZES;
  light?: boolean;
  showText?: boolean;
}) {
  const s = SIZES[size];

  return (
    <span
      className={`flex items-center gap-3 font-fraunces font-bold tracking-[-0.02em] ${s.text} ${light ? "text-white" : "text-med-ink"}`}
    >
      <Image
        src="/logo-icon.png"
        alt="InforMed"
        width={s.px}
        height={s.px}
        className={`flex-shrink-0 rounded-full object-cover ${s.box}`}
        priority={size === "md"}
      />
      {showText && "InforMed"}
    </span>
  );
}
