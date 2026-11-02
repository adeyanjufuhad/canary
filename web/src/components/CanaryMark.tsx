/** The Canary bird mark. Fills with currentColor; decorative, so hidden from screen readers. */
export default function CanaryMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="480 478 880 880" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <path d="M1045 535L1172 523L1228 570V660L1072 738L975 650Z" />
      <path d="M1260 582L1337 615L1262 653Z" />
      <path d="M957 680L1052 765V852L996 925L562 1105Z" />
      <path d="M1085 768L1228 700V895Q1228 932 1205 960L1125 1058Q1108 1078 1080 1083L985 1106L1040 1192H1228V1222H830V1192H997L936 1100L757 1060L1018 950L1085 860Z" />
      <path d="M697 1082L795 1103L625 1313H502L680 1092Z" />
    </svg>
  );
}
