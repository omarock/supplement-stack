"use client";

import Link from "next/link";
import { useId } from "react";

// SuppDoc.io brand mark: a tilted teal+coral capsule + the "SuppDoc.io" wordmark
// (Manrope ExtraBold, supplied as vector paths so no webfont is needed). The three
// wordmark colour groups — "Supp", "Doc", ".io" — read from CSS variables
// (--logo-supp / --logo-doc / --logo-io, set per theme in globals.css), so the
// lockup themes itself in light and dark with no extra request and no flash. The
// capsule colours are fixed; they read well on both. Pass `onDark` to force the
// dark-surface colours regardless of the active theme.

const DARK = { supp: "#f4f7f5", doc: "#3fc394", io: "#8fa89b" } as const;

/** The capsule mark on its own (icon-only spots, e.g. compact headers). */
export function SDMark({ size = 28, monoColor }: { size?: number; monoColor?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block" }} aria-hidden>
      <defs><clipPath id={`cap-${uid}`}><rect x="-15" y="-7" width="30" height="14" rx="7" /></clipPath></defs>
      <g transform="translate(20 20) rotate(-35)">
        <g clipPath={`url(#cap-${uid})`}>
          <rect x="-15" y="-7" width="15" height="14" fill={monoColor ?? "#79C6BC"} />
          <rect x="0" y="-7" width="15" height="14" fill={monoColor ?? "#F0B49E"} />
        </g>
        <line x1="0" y1="-7" x2="0" y2="7" stroke={monoColor ? "rgba(255,255,255,0.6)" : "#fff"} strokeWidth="1.7" />
      </g>
    </svg>
  );
}

/** Full lockup (capsule + "SuppDoc.io" wordmark), theme-aware. Sized by `height`
 * (number → px) or, for responsive use, by `h` (any CSS length, e.g. a var). */
export function SDFullLogo({ height = 30, h, onDark = false }: { height?: number; h?: string; onDark?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const width = Math.round((457 / 132) * height);
  const supp = onDark ? DARK.supp : "var(--logo-supp, #0F1A15)";
  const doc = onDark ? DARK.doc : "var(--logo-doc, #0C7A54)";
  const io = onDark ? DARK.io : "var(--logo-io, #9DB0A6)";
  return (
    <svg width={width} height={height} viewBox="0 0 457 132" style={{ display: "block", height: h ?? height, width: h ? "auto" : width }} role="img" aria-label="SuppDoc.io">
      <defs><clipPath id={`lcap-${uid}`}><rect x="-39" y="-17" width="78" height="34" rx="17" /></clipPath></defs>
      {/* Capsule */}
      <g transform="translate(52 66) rotate(-35)">
        <g clipPath={`url(#lcap-${uid})`}>
          <rect x="-39" y="-17" width="39" height="34" fill="#79C6BC" />
          <rect x="0" y="-17" width="39" height="34" fill="#F0B49E" />
        </g>
        <line x1="0" y1="-17" x2="0" y2="17" stroke="#fff" strokeWidth="2.4" />
      </g>
      {/* "Supp" */}
      <path fill={supp} transform="translate(124 92) scale(0.032 -0.032)" d="M684 -30Q524 -30 395.5 26.5Q267 83 184.5 188.5Q102 294 80 440L364 482Q394 358 488.0 291.0Q582 224 702 224Q769 224 832.0 245.0Q895 266 935.5 307.0Q976 348 976 408Q976 430 969.5 450.5Q963 471 948.0 489.0Q933 507 905.5 523.0Q878 539 836 552L462 662Q420 674 364.5 696.0Q309 718 257.0 759.0Q205 800 170.5 867.5Q136 935 136 1038Q136 1183 209.0 1279.0Q282 1375 404.0 1422.0Q526 1469 674 1468Q823 1466 940.0 1417.0Q1057 1368 1136.0 1274.5Q1215 1181 1250 1046L956 996Q940 1066 897.0 1114.0Q854 1162 794.5 1187.0Q735 1212 670 1214Q606 1216 549.5 1196.5Q493 1177 457.5 1140.0Q422 1103 422 1052Q422 1005 451.0 975.5Q480 946 524.0 928.0Q568 910 614 898L864 830Q920 815 988.0 790.5Q1056 766 1118.5 722.5Q1181 679 1221.5 608.0Q1262 537 1262 428Q1262 312 1213.5 225.5Q1165 139 1083.0 82.5Q1001 26 897.5 -2.0Q794 -30 684 -30Z" />
      <path fill={supp} transform="translate(164.444 92) scale(0.032 -0.032)" d="M542 -32Q415 -32 335.0 11.0Q255 54 210.5 120.0Q166 186 147.0 257.5Q128 329 124.0 388.0Q120 447 120 474V1080H396V570Q396 533 400.0 475.5Q404 418 425.0 360.0Q446 302 493.5 263.0Q541 224 628 224Q663 224 703.0 235.0Q743 246 778.0 277.5Q813 309 835.5 370.5Q858 432 858 532L1014 458Q1014 330 962.0 218.0Q910 106 805.5 37.0Q701 -32 542 -32ZM892 0V358H858V1080H1132V0Z" />
      <path fill={supp} transform="translate(202.648 92) scale(0.032 -0.032)" d="M670 -30Q509 -30 401.0 45.0Q293 120 238.5 249.0Q184 378 184 540Q184 702 238.0 831.0Q292 960 397.0 1035.0Q502 1110 656 1110Q811 1110 926.0 1036.0Q1041 962 1104.5 833.5Q1168 705 1168 540Q1168 378 1105.5 249.0Q1043 120 931.0 45.0Q819 -30 670 -30ZM138 -480V1080H378V340H412V-480ZM626 212Q714 212 770.0 256.0Q826 300 853.0 374.5Q880 449 880 540Q880 630 852.0 704.5Q824 779 765.5 823.5Q707 868 616 868Q531 868 478.5 827.0Q426 786 402.0 712.0Q378 638 378 540Q378 442 402.0 368.0Q426 294 480.5 253.0Q535 212 626 212Z" />
      <path fill={supp} transform="translate(240.084 92) scale(0.032 -0.032)" d="M670 -30Q509 -30 401.0 45.0Q293 120 238.5 249.0Q184 378 184 540Q184 702 238.0 831.0Q292 960 397.0 1035.0Q502 1110 656 1110Q811 1110 926.0 1036.0Q1041 962 1104.5 833.5Q1168 705 1168 540Q1168 378 1105.5 249.0Q1043 120 931.0 45.0Q819 -30 670 -30ZM138 -480V1080H378V340H412V-480ZM626 212Q714 212 770.0 256.0Q826 300 853.0 374.5Q880 449 880 540Q880 630 852.0 704.5Q824 779 765.5 823.5Q707 868 616 868Q531 868 478.5 827.0Q426 786 402.0 712.0Q378 638 378 540Q378 442 402.0 368.0Q426 294 480.5 253.0Q535 212 626 212Z" />
      {/* "Doc" */}
      <path fill={doc} transform="translate(277.520 92) scale(0.032 -0.032)" d="M140 0V1440H606Q623 1440 676.0 1439.0Q729 1438 778 1432Q952 1411 1073.0 1311.0Q1194 1211 1257.0 1057.0Q1320 903 1320 720Q1320 537 1257.0 383.0Q1194 229 1073.0 129.0Q952 29 778 8Q729 2 676.0 1.0Q623 0 606 0ZM416 256H606Q633 256 679.0 257.5Q725 259 762 266Q856 285 915.5 354.0Q975 423 1003.5 520.0Q1032 617 1032 720Q1032 828 1002.5 925.0Q973 1022 913.0 1089.0Q853 1156 762 1174Q725 1182 679.0 1183.0Q633 1184 606 1184H416Z" />
      <path fill={doc} transform="translate(320.460 92) scale(0.032 -0.032)" d="M626 -30Q463 -30 340.0 43.0Q217 116 148.5 244.5Q80 373 80 540Q80 709 150.0 837.5Q220 966 343.0 1038.0Q466 1110 626 1110Q789 1110 912.5 1037.0Q1036 964 1105.0 835.5Q1174 707 1174 540Q1174 372 1104.5 243.5Q1035 115 911.5 42.5Q788 -30 626 -30ZM626 224Q757 224 821.5 312.5Q886 401 886 540Q886 684 820.5 770.0Q755 856 626 856Q537 856 480.0 816.0Q423 776 395.5 705.0Q368 634 368 540Q368 395 433.5 309.5Q499 224 626 224Z" />
      <path fill={doc} transform="translate(358.088 92) scale(0.032 -0.032)" d="M616 -30Q448 -30 328.0 45.0Q208 120 144.0 249.0Q80 378 80 540Q80 704 146.5 833.0Q213 962 334.0 1036.0Q455 1110 620 1110Q811 1110 940.5 1013.5Q1070 917 1106 750L834 678Q810 762 750.5 809.0Q691 856 616 856Q530 856 475.0 814.5Q420 773 394.0 701.5Q368 630 368 540Q368 399 430.5 311.5Q493 224 616 224Q708 224 756.0 266.0Q804 308 828 386L1106 328Q1060 156 932.0 63.0Q804 -30 616 -30Z" />
      {/* ".io" */}
      <path fill={io} transform="translate(396.900 92) scale(0.020 -0.020)" d="M184 0V272H456V0Z" />
      <path fill={io} transform="translate(408.500 92) scale(0.020 -0.020)" d="M160 1230V1470H432V1230ZM160 0V1080H432V0Z" />
      <path fill={io} transform="translate(419.140 92) scale(0.020 -0.020)" d="M626 -30Q463 -30 340.0 43.0Q217 116 148.5 244.5Q80 373 80 540Q80 709 150.0 837.5Q220 966 343.0 1038.0Q466 1110 626 1110Q789 1110 912.5 1037.0Q1036 964 1105.0 835.5Q1174 707 1174 540Q1174 372 1104.5 243.5Q1035 115 911.5 42.5Q788 -30 626 -30ZM626 224Q757 224 821.5 312.5Q886 401 886 540Q886 684 820.5 770.0Q755 856 626 856Q537 856 480.0 816.0Q423 776 395.5 705.0Q368 634 368 540Q368 395 433.5 309.5Q499 224 626 224Z" />
    </svg>
  );
}

/** Back-compat: the wordmark lockup. (Internally the full themed lockup.) */
export function SDWordmark({ size = 22, onDark }: { size?: number; color?: string; accent?: string; weight?: number; onDark?: boolean }) {
  return <SDFullLogo height={Math.round(size * 1.4)} onDark={onDark} />;
}

/** Combined logo (capsule + wordmark) with optional link wrap. Pass `h` (a CSS
 * length such as "var(--logo-h)") for a responsive height; otherwise `size`. */
export default function SuppdocLogo({
  size = 22, h, asLink = true, href = "/", onDark = false,
}: {
  size?: number; h?: string; color?: string; accent?: string; asLink?: boolean; href?: string; onDark?: boolean;
}) {
  const logo = <SDFullLogo height={Math.round(size * 1.5)} h={h} onDark={onDark} />;
  if (asLink) {
    return (
      <Link href={href} aria-label="SuppDoc.io home" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
        {logo}
      </Link>
    );
  }
  return logo;
}
