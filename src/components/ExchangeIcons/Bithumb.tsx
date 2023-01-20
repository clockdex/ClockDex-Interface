import useTheme from 'hooks/useTheme'

function Okex({ width, height }: { width?: number; height?: number }) {
  const theme = useTheme()

  return (
    <svg width={width || 160} height={height || 57} viewBox="0 0 160 57" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M68.1676 23.8673H65.6712L61.2766 39.238H66.1457L69.8595 26.2606C70.0658 25.7036 69.9833 25.064 69.6325 24.5688C69.3024 24.1149 68.7453 23.8467 68.1676 23.8673Z"
        fill={theme.text}
      />
      <path
        d="M71.572 20.4219C71.1388 21.8042 69.8802 22.7739 68.436 22.8564C67.4457 22.8977 66.6204 22.1549 66.5791 21.1646C66.5585 20.917 66.5998 20.6488 66.7029 20.4219C67.1362 19.0395 68.3947 18.0698 69.839 17.9873C70.4373 17.946 71.015 18.2349 71.3864 18.73C71.5514 18.9776 71.6752 19.2665 71.6958 19.5553C71.7165 19.8442 71.6752 20.133 71.572 20.4219Z"
        fill={theme.text}
      />
      <path
        d="M91.4816 23.0421C90.5119 23.0421 89.5628 23.2278 88.6757 23.5785C88.2424 23.7642 87.8504 24.0118 87.4584 24.28L88.5725 20.36C88.7582 19.8029 88.6963 19.1633 88.3456 18.6888C88.1805 18.4618 87.9535 18.2762 87.706 18.1524C87.4584 18.0286 87.1695 17.9667 86.8807 17.9873H84.4874L78.4216 39.2381H83.167L85.4984 31.0679C85.7459 29.995 86.2824 29.0253 87.0457 28.2413C87.6234 27.643 88.4281 27.2923 89.2534 27.3129C89.9136 27.251 90.5532 27.6224 90.8214 28.2413C91.1102 29.1698 91.069 30.1601 90.7388 31.0679L88.4281 39.2175H93.2353L95.5254 31.233C96.2269 29.3142 96.2063 27.2097 95.4635 25.3322C94.7208 23.8261 93.1528 22.939 91.4816 23.0421Z"
        fill={theme.text}
      />
      <path
        d="M134.747 23.001C132.498 22.9597 130.29 23.5993 128.413 24.8372C127.587 23.5993 126.184 22.9185 124.699 23.0216C123.729 23.0216 122.78 23.2073 121.893 23.558C121.377 23.785 120.882 24.0945 120.428 24.4452C120.304 23.5787 119.52 22.9597 118.654 23.0216H116.281L111.66 39.2176H116.405L118.757 31.0268C119.005 29.9539 119.541 28.9842 120.304 28.2002C120.593 27.9114 120.923 27.6638 121.315 27.4987C121.687 27.3337 122.099 27.2511 122.512 27.2718C122.842 27.2305 123.172 27.313 123.44 27.4781C123.709 27.6432 123.936 27.9114 124.059 28.2002C124.348 29.1286 124.307 30.119 123.977 31.0268L121.645 39.2176H126.453L128.805 31.0268C129.052 29.9745 129.589 28.9842 130.352 28.2002C130.93 27.6019 131.734 27.2511 132.56 27.2718C133.241 27.2099 133.86 27.5813 134.128 28.2002C134.417 29.1286 134.375 30.119 134.045 31.0268L131.693 39.2176H136.5L138.791 31.1918C139.492 29.2731 139.471 27.1686 138.729 25.2911C138.007 23.785 136.418 22.8772 134.747 23.001Z"
        fill={theme.text}
      />
      <path
        d="M96.8872 32.244L99.5281 23.001H104.335L101.694 32.244C100.91 34.9675 103.469 34.9674 103.469 34.9674C105.099 34.9468 106.502 33.8327 106.914 32.244L109.555 23.001H114.301L111.66 32.244C110.484 36.4529 106.605 39.3208 102.251 39.2176C102.251 39.2176 94.7621 39.7128 96.8872 32.244Z"
        fill={theme.text}
      />
      <path
        d="M155.131 31.2127C155.832 29.2939 155.812 27.1895 155.069 25.312C154.326 23.8059 152.758 22.9187 151.108 23.0425C150.138 23.0218 149.189 23.2075 148.302 23.5789C147.869 23.7646 147.477 23.9915 147.085 24.2804L148.199 20.381C148.384 19.8239 148.322 19.205 147.972 18.7098C147.807 18.4828 147.58 18.2972 147.312 18.1734C147.064 18.0496 146.775 17.9877 146.486 18.0083H144.114L140.09 32.1205C137.883 39.8368 145.682 39.2591 145.682 39.2591C145.682 39.2591 152.8 39.3829 155.131 31.2127ZM150.365 31.0476C150.097 32.1618 149.56 33.1933 148.776 34.0393C148.488 34.3487 148.157 34.5757 147.765 34.7407C147.394 34.9058 146.981 34.9883 146.569 34.9677C145.888 35.0502 145.228 34.6582 144.959 34.0186C144.691 33.0283 144.774 31.9761 145.145 31.027C145.393 29.9541 145.929 28.9845 146.693 28.2004C147.27 27.6021 148.075 27.2514 148.9 27.272C149.56 27.2101 150.2 27.5815 150.468 28.2004C150.736 29.1495 150.716 30.1398 150.365 31.0476Z"
        fill={theme.text}
      />
      <path
        d="M78.6691 20.3602C78.7723 20.092 78.7929 19.7825 78.7517 19.4937C78.7104 19.2048 78.6072 18.916 78.4422 18.6684C78.1121 18.2145 77.5756 17.9463 77.0186 17.9669H74.5427L69.4261 35.9166C68.7246 38.3925 69.9418 39.0114 71.0972 39.1146C71.9225 39.1765 72.8922 39.2177 73.8413 39.2177C74.4602 39.2177 75.0585 39.1971 75.5537 39.1765L76.0489 39.1558L77.1424 35.3183H74.9967C74.419 35.3183 74.4809 35.112 74.5221 34.9057L76.7297 27.1481H77.328C78.0089 27.1275 78.6485 26.9005 79.1849 26.4879C79.7626 26.0752 80.1752 25.4563 80.3816 24.7754L80.7529 23.4963H77.782L78.6691 20.3602Z"
        fill={theme.text}
      />
      <path
        d="M61.8749 31.2127C62.5764 29.2939 62.5557 27.1895 61.813 25.312C61.0703 23.8265 59.5022 22.9187 57.8517 23.0425C56.882 23.0218 55.9329 23.2075 55.0457 23.5789C54.6125 23.7646 54.2205 23.9915 53.8285 24.2804L54.9426 20.381C55.1283 19.8239 55.0664 19.205 54.7156 18.7098C54.5506 18.4828 54.3236 18.2972 54.0761 18.1734C53.8285 18.0496 53.5396 17.9877 53.2508 18.0083H50.8575L46.8343 32.1205C44.6267 39.8368 52.4255 39.2591 52.4255 39.2591C52.4255 39.2591 59.5229 39.3829 61.8749 31.2127ZM57.1089 31.0476C56.8407 32.1618 56.3043 33.1933 55.5203 34.0393C54.9426 34.6376 54.1379 34.9883 53.3127 34.9677C52.6318 35.0502 51.9716 34.6582 51.6828 34.0186C51.4145 33.0283 51.4971 31.9761 51.8684 31.027C52.116 29.9541 52.6525 28.9845 53.4158 28.2004C53.9935 27.6021 54.7982 27.2514 55.6234 27.272C56.2837 27.2101 56.9233 27.5815 57.1915 28.2004C57.4803 29.1495 57.4597 30.1398 57.1089 31.0476Z"
        fill={theme.text}
      />
      <path
        d="M4.62144 24.2801C3.8787 25.9926 4.68334 27.9938 6.39578 28.716C6.87032 28.9223 7.38611 29.0048 7.92254 28.9842H9.11919L12.5234 17.0796H6.70526L4.62144 24.2801Z"
        fill="#D62817"
      />
      <path
        d="M36.7658 21.6805C35.1978 18.5444 32.4538 17.0383 28.575 17.0383H21.3539L17.9702 29.0048H23.1076C23.9328 28.881 24.7375 29.3143 25.0676 30.0776C25.439 31.233 25.3977 32.4916 24.9644 33.6469C24.6343 35.0499 23.9535 36.3497 22.9838 37.4226C22.2617 38.1859 21.2713 38.6192 20.2191 38.5986C19.3526 38.7017 18.5273 38.2066 18.1972 37.4019C17.8671 36.164 17.9496 34.8436 18.4241 33.6469L24.7168 11.4471C25.1295 10.2711 24.9644 8.99188 24.2629 7.96029C23.5615 6.99059 22.4061 6.45416 21.2094 6.51606H14.2152L5.92123 35.7514C1.38222 51.7411 17.4544 50.5651 17.4544 50.5651C17.4544 50.5651 32.0824 50.8952 36.9103 33.9358C38.3132 28.9429 38.272 24.8165 36.7658 21.6805Z"
        fill="#EC7000"
      />
      <path
        d="M36.9103 33.8738C38.3339 28.9221 38.2927 24.8164 36.7659 21.701C35.1979 18.5856 32.4538 17.1001 28.5751 17.1001H23.1283L19.7446 29.0047H23.087C23.9123 28.8809 24.7169 29.3142 25.047 30.0569C25.4184 31.2123 25.3771 32.4502 24.9439 33.5849"
        fill="url(#paint0_linear_15775_167310)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_15775_167310"
          x1="30.6196"
          y1="29.1166"
          x2="26.5943"
          y2="22.6279"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D62616" stopOpacity="0" />
          <stop offset="1" stopColor="#D62616" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default Okex