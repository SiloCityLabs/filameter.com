import React from 'react';
import type { Thing, WithContext } from 'schema-dts';

interface StructuredDataProps<T extends Thing> {
  /**
   * The JSON-LD data object, including the '@context'.
   * Should be generated using one of the schema generator functions.
   */
  data: WithContext<T>;
  /**
   * Optional ID for the script tag. Useful for debugging or specific targeting.
   */
  id?: string;
}

/**
 * A React component to safely inject JSON-LD structured data into the page.
 *
 * @param props - The props for the component.
 * @param props.data - The JSON-LD data object.
 * @param props.id - Optional ID for the script tag.
 * @returns A script tag with the JSON-LD data, or null if no data is provided.
 */
const StructuredData = <T extends Thing>({
  data,
  id,
}: StructuredDataProps<T>): React.JSX.Element | null => {
  if (!data) {
    return null;
  }

  // Ensure '@context' is present, as it's crucial for JSON-LD
  if (!data['@context']) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'StructuredData component: Missing "@context" in data. Schema will likely be invalid.',
        data
      );
    }
  }

  try {
    const jsonLdString = JSON.stringify(data);
    return (
      <script
        type='application/ld+json'
        id={id}
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
        data-testid={id ? `structured-data-${id}` : 'structured-data'}
      />
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('StructuredData component: Error stringifying JSON-LD data.', error, data);
    }
    return null; // Avoid rendering a broken script tag
  }
};

export default StructuredData;
