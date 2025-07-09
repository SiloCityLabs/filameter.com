import React from 'react';

export interface FaqItem {
  eventKey: string;
  question: string;
  answer: string | React.JSX.Element;
}

export const faqData: FaqItem[] = [
  {
    eventKey: '0',
    question: 'Is FilaMeter free to use?',
    answer:
      'Yes. FilaMeter is free to use and includes full access to core features such as filament tracking, manual updates, and use on a single device.',
  },
  {
    eventKey: '1',
    question: 'Is there a paid version of FilaMeter?',
    answer:
      'Yes. While the core platform is free, a paid version is available and removes the limitations of the free version. The paid version allows for automatic, real-time syncing of data across multiple devices. Subscriptions are available in 1-year, 3-year, or lifetime options.',
  },
  {
    eventKey: '2',
    question: 'Do I need to create an account to use FilaMeter?',
    answer:
      'No traditional account with a username or password is required. FilaMeter recognizes users through browser-based LocalStorage. However, providing a valid email address is necessary for syncing across multiple devices.',
  },
  {
    eventKey: '3',
    question: 'Can I use FilaMeter across multiple devices?',
    answer:
      'Yes. Multi-device use is supported in both the free and paid versions. Free users must manually sync their data and can do so once every 60 seconds. Paid users benefit from automatic, real-time syncing across all their devices.',
  },
  {
    eventKey: '4',
    question: 'How can I contact FilaMeter for feature requests or bug reports?',
    answer: (
      <>
        You can submit feature suggestions or report bugs directly through the{' '}
        <a href='/feedback'>feedback page</a> on filameter.com. This is the best way to ensure your
        input reaches the development team.
      </>
    ),
  },
  {
    eventKey: '5',
    question: 'What information can I track with FilaMeter?',
    answer: (
      <>
        FilaMeter allows you to manage and monitor your filament spools using the following fields:
        <ul>
          <li>
            <b>Filament</b> - The type or brand of filament
          </li>
          <li>
            <b>Color</b> - The filament's color
          </li>
          <li>
            <b>Used Weight</b> - The amount of filament used so far in grams
          </li>
          <li>
            <b>Total Weight</b> - The original full weight of the spool in grams
          </li>
          <li>
            <b>Weight Left</b> - The remaining filament weight, calculated automatically in grams
          </li>
          <li>
            <b>Location</b> - Optional field for identifying where the spool is stored
          </li>
          <li>
            <b>Comments</b> - Any additional notes about the spool
          </li>
        </ul>
      </>
    ),
  },
  {
    eventKey: '6',
    question: 'What actions can I perform on a spool entry?',
    answer: (
      <>
        Each filament entry in FilaMeter includes an Actions section with three options represented
        by icons:
        <ul>
          <li>
            <b>Edit</b> - Modify the existing spool details
          </li>
          <li>
            <b>Delete</b> - Permanently remove a spool from your list
          </li>
          <li>
            <b>Duplicate</b> - Create a copy of an existing spool entry for quicker input
          </li>
        </ul>
      </>
    ),
  },
  {
    eventKey: '7',
    question: 'How do FilaMeter Labels work?',
    answer:
      'FilaMeter Labels are QR code stickers that link directly to a specific spool in your account. Scanning a label with your phone or device takes you straight to that spool’s entry in FilaMeter, allowing for quick updates without needing to search manually.',
  },
  {
    eventKey: '8',
    question: 'Can I use FilaMeter on mobile devices?',
    answer:
      'Yes, FilaMeter is fully accessible through modern mobile browsers. While there is no dedicated mobile app at this time, the web interface is responsive and designed to work well on phones and tablets.',
  },
  {
    eventKey: '9',
    question: 'Will FilaMeter support automated filament tracking tools in the future?',
    answer:
      'Yes. We are developing SpoolSense, a standalone optical tracking device that monitors filament usage in real time. SpoolSense will integrate directly with FilaMeter to update usage automatically.',
  },
  {
    eventKey: '10',
    question: 'Is my data secure?',
    answer: (
      <>
        All spool data is stored securely. We follow standard best practices to ensure the
        protection of your information. If you have questions about data privacy or storage, please
        utilize our <a href='https://filameter.com/feedback'>feedback page</a>.
      </>
    ),
  },
];
