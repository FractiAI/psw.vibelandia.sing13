/** Shared Fair Exchange / honor illustration (boarding + paid downloads). */
export function HonorFarmstandFigure() {
  const src = `${import.meta.env.BASE_URL}images/honor-farmstand-paybox.png`;
  return (
    <figure className="boarding-honor-figure">
      <img
        src={src}
        alt="Illustration of a wooden farmstand honor box with produce and a cash slot, warm sunlight."
        width={640}
        height={360}
        loading="lazy"
        decoding="async"
      />
      <figcaption>Same energy as the roadside stand — you pay, we trust you meant it.</figcaption>
    </figure>
  );
}
