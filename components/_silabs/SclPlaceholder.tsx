// --- React ---
import React from "react";
import ContentLoader from "react-content-loader";

const SclPlaceholder = ({
  isLoading,
  value,
}: {
  isLoading: boolean;
  value: string;
}) => {
  const containsHTML =
    /<(?!(?:area|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b)[a-z][^>]*>/i.test(
      value
    );

  return isLoading ? (
    <ContentLoader
      height={30}
      width={65}
      speed={1}
      backgroundColor={"#333"}
      foregroundColor={"#999"}
      viewBox="0 0 65 30"
    >
      <rect x="0" y="5.5" rx="4" ry="4" width="65" height="15" />
    </ContentLoader>
  ) : containsHTML ? (
    <div dangerouslySetInnerHTML={{ __html: value }} />
  ) : (
    <>{value}</>
  );
};

export default SclPlaceholder;
