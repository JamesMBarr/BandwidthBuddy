<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    version="1.1"
    viewBox="0 0 135 30"
  >
    <g transform="translate(30, 18)">
      <text x="0" y="0" class="primary">Bandwidth</text>
      <text x="63.5" y="0.2" class="secondary">Buddy</text>
    </g>
    <ellipse
      class="primary-fill primary-stroke"
      cx="15"
      cy="15"
      rx="13"
      ry="13"
      pointer-events="none"
    />
    <ellipse
      class="primary-fill"
      cx="15"
      cy="15"
      rx="12"
      ry="12"
      stroke="#ffffff"
    />
    <g transform="translate(2.5, 1.5)">
      <path
        d="M 6 0 L 20 10 L 6 20 Z"
        fill="rgb(255, 255, 255)"
        transform="rotate(-90,13,10.56)"
      />
      <path
        class="primary-stroke"
        d="M 10 6.72 L 18.09 18.66"
        stroke-miterlimit="10"
      />
      <path
        class="primary-stroke"
        d="M 6.64 10.91 L 11.93 18.42"
        stroke-miterlimit="10"
      />
    </g>
  </svg>
</template>

<style scoped>
.primary-fill {
  fill: var(--primary);
}

.primary-stroke {
  stroke: var(--primary);
}

text {
  font-family: Poppins;
  font-size: 12px;
}

text.primary {
  color: var(--primary);
  font-weight: bold;
}
text.secondary {
  color: var(--h1-color);
}
</style>
