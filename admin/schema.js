// What the admin can edit, and how each field should be presented.
//
// This file is the single description of the content model. The form builder
// in admin.js knows nothing about hero slides or project groups; it only knows
// how to render the field types listed here. Adding a field to the admin means
// adding a line here, not writing another form.
//
// Field types:
//   text      one line
//   textarea  several lines
//   image     a path under images/, with an upload button
//   strings   a list of plain strings, one per line
//   list      a repeating group of fields, with add, remove and reorder
//   select    one of a fixed set of values

const ICON_NAMES = [
  'briefcase', 'cap', 'pin', 'badge', 'building', 'seal',
  'chart', 'gear', 'monitor', 'users',
];

export const FILES = [
  {
    id: 'hero',
    label: 'Home',
    path: 'sections/hero/hero.json',
    help: 'The first thing a visitor sees.',
    fields: [
      { key: 'eyebrow', label: 'Small line above the title', type: 'text' },
      { key: 'display', label: 'Big title', type: 'text' },
      { key: 'name', label: 'Your name', type: 'text' },
      { key: 'sub', label: 'Short introduction', type: 'textarea' },
      { key: 'photo', label: 'Portrait', type: 'image' },
      { key: 'photoAlt', label: 'Portrait description', type: 'text',
        help: 'Read aloud by screen readers, and shown if the photo fails to load.' },
      { key: 'cta.label', label: 'Button text', type: 'text' },
      { key: 'scrollHint', label: 'Scroll cue', type: 'text' },
    ],
  },

  {
    id: 'journey',
    label: 'Get to know me',
    path: 'sections/journey/journey.json',
    help: 'The carousel of moments. Slides show in the order listed here.',
    fields: [
      {
        key: 'slides', type: 'list', label: 'Slides', addLabel: 'Add a slide',
        titleKey: 'title',
        fields: [
          { key: 'label', label: 'Date', type: 'text' },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'text', label: 'Description', type: 'textarea' },
          {
            key: 'images', type: 'list', label: 'Pictures', addLabel: 'Add a picture',
            titleKey: 'alt',
            help: 'Two or more sit side by side and trade width when pointed at.',
            fields: [
              { key: 'src', label: 'Picture', type: 'image' },
              { key: 'alt', label: 'Description', type: 'text' },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'background',
    label: 'Background',
    path: 'sections/background/background.json',
    fields: [
      { key: 'role', label: 'Role line', type: 'text' },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      {
        key: 'meta', type: 'list', label: 'Facts', addLabel: 'Add a fact',
        titleKey: 'field',
        fields: [
          { key: 'field', label: 'Label', type: 'text' },
          { key: 'value', label: 'Value', type: 'text' },
          { key: 'icon', label: 'Icon', type: 'select', options: ICON_NAMES },
        ],
      },
      {
        key: 'timeline', type: 'list', label: 'History', addLabel: 'Add an entry',
        titleKey: 'role',
        fields: [
          { key: 'role', label: 'Role or qualification', type: 'text' },
          { key: 'org', label: 'Organisation', type: 'text' },
          { key: 'period', label: 'Dates', type: 'text' },
          { key: 'detail', label: 'Detail', type: 'textarea' },
          { key: 'tags', label: 'Tags', type: 'strings' },
          { key: 'kind', label: 'Kind', type: 'select', options: ['work', 'education'] },
          { key: 'icon', label: 'Icon', type: 'select', options: ICON_NAMES },
        ],
      },
    ],
  },

  {
    id: 'projects',
    label: 'Projects',
    path: 'sections/projects/projects.json',
    fields: [
      { key: 'intro', label: 'Introduction', type: 'textarea' },
      {
        key: 'groups', type: 'list', label: 'Groups', addLabel: 'Add a group',
        titleKey: 'name',
        fields: [
          { key: 'name', label: 'Group name', type: 'text' },
          { key: 'icon', label: 'Icon', type: 'select', options: ICON_NAMES },
          {
            key: 'items', type: 'list', label: 'Projects', addLabel: 'Add a project',
            titleKey: 'title',
            fields: [
              { key: 'title', label: 'Project', type: 'text' },
              { key: 'client', label: 'Client', type: 'text' },
              { key: 'period', label: 'Role or year', type: 'text' },
              { key: 'blurb', label: 'Short description', type: 'textarea' },
              { key: 'detail', label: 'Full description', type: 'textarea',
                help: 'Shown when the card is opened.' },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'skills',
    label: 'Skills',
    path: 'sections/skills/skills.json',
    fields: [
      { key: 'intro', label: 'Introduction', type: 'textarea' },
      {
        key: 'groups', type: 'list', label: 'Groups', addLabel: 'Add a group',
        titleKey: 'name',
        fields: [
          { key: 'name', label: 'Group name', type: 'text' },
          { key: 'icon', label: 'Icon', type: 'select', options: ICON_NAMES },
          { key: 'items', label: 'Skills', type: 'strings' },
        ],
      },
    ],
  },

  {
    id: 'achievements',
    label: 'Achievements',
    path: 'sections/achievements/achievements.json',
    // this file is a bare list rather than an object with named fields
    root: 'array',
    list: {
      label: 'Achievements', addLabel: 'Add an achievement', titleKey: 'title',
      fields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'issuer', label: 'Issued by', type: 'text' },
        { key: 'year', label: 'Date shown', type: 'text' },
        { key: 'sort', label: 'Sort number', type: 'text',
          help: 'Higher shows first. Year and month, so February 2025 is 202502.' },
        { key: 'note', label: 'Note', type: 'textarea' },
        { key: 'kind', label: 'Kind', type: 'text' },
      ],
    },
  },

  {
    id: 'contact',
    label: 'Contact',
    path: 'sections/contact/contact.json',
    fields: [
      { key: 'intro', label: 'Introduction', type: 'textarea' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'note', label: 'Note underneath', type: 'textarea' },
    ],
  },
];
