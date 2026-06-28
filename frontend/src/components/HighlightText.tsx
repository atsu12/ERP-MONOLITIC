interface Props {

  text: string;

  highlight: string;

}

function HighlightText({
  text,
  highlight
}: Props) {

  if (!highlight.trim()) {

    return <>{text}</>;

  }

  const regex =
    new RegExp(
      `(${highlight})`,
      "gi"
    );

  const parts =
    text.split(regex);

  return (

    <>

      {parts.map((part, index) => {

        const isMatch =
          part.toLowerCase() ===
          highlight.toLowerCase();

        return isMatch ? (

          <mark
            key={index}
            className="bg-yellow-200 text-black px-1 rounded"
          >

            {part}

          </mark>

        ) : (

          <span key={index}>

            {part}

          </span>

        );

      })}

    </>

  );

}

export default HighlightText;