import React, { useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const editorConfiguration = {
  toolbar: {
    items: [
      "heading",
      "|",
      "bold",
      "italic",
      "underline",
      "|",
      "link",
      "imageUpload",
      "blockQuote",
      "insertTable",
      "mediaEmbed",
      "codeBlock",
      "|",
      "bulletedList",
      "numberedList",
      "|",
      "outdent",
      "indent",
      "|",
      "undo",
      "redo",
    ],
    shouldNotGroupWhenFull: true,
  },
  heading: {
    options: [
      { model: "paragraph", title: "Paragraph" },
      { model: "heading1", view: "h1", title: "Heading 1" },
      { model: "heading2", view: "h2", title: "Heading 2" },
      { model: "heading3", view: "h3", title: "Heading 3" },
      { model: "heading4", view: "h4", title: "Heading 4" },
      { model: "heading5", view: "h5", title: "Heading 5" },
      { model: "heading6", view: "h6", title: "Heading 6" },
    ],
  },
  image: {
    toolbar: ["imageTextAlternative", "imageStyle:full", "imageStyle:side"],
  },
  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
};

editorConfiguration.mediaEmbed = {
  previewsInData: true,
};

editorConfiguration.language = "en";

export default function MARKDOWN_EDITOR(props) {
  const [isClient, setIsClient] = React.useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <div>
      <style>{`
                [data-bs-theme="dark"] .ck.ck-editor__main > .ck-editor__editable {
                    background-color: var(--bs-body-bg) !important;
                    color: var(--bs-body-color) !important;
                    font-size: 14px !important;
                    line-height: 1.6 !important;
                }
                [data-bs-theme="dark"] .ck.ck-toolbar {
                    background-color: var(--bs-tertiary-bg) !important;
                    border-color: var(--bs-border-color) !important;
                }
                [data-bs-theme="dark"] .ck.ck-button {
                    color: var(--bs-body-color) !important;
                }
                [data-bs-theme="dark"] .ck.ck-button:hover {
                    background-color: var(--bs-secondary-bg) !important;
                }
                [data-bs-theme="dark"] .ck.ck-dropdown__button:hover {
                    background-color: var(--bs-secondary-bg) !important;
                }
                [data-bs-theme="dark"] .ck.ck-list {
                    background-color: var(--bs-body-bg) !important;
                    border-color: var(--bs-border-color) !important;
                }
                [data-bs-theme="dark"] .ck.ck-list__item {
                    color: var(--bs-body-color) !important;
                }
                [data-bs-theme="dark"] .ck.ck-list__item:hover {
                    background-color: var(--bs-secondary-bg) !important;
                }
                /* Ensure text doesn't become oversized when underlined */
                .ck.ck-editor__main > .ck-editor__editable u {
                    font-size: inherit !important;
                    line-height: inherit !important;
                }
                /* Fix italic and bold sizing issues */
                .ck-editor__editable em,
                .ck-editor__editable i {
                    font-size: inherit !important;
                    font-style: italic !important;
                    line-height: inherit !important;
                }
                .ck-editor__editable strong,
                .ck-editor__editable b {
                    font-size: inherit !important;
                    font-weight: bold !important;
                    line-height: inherit !important;
                }
                /* Fix strikethrough sizing */
                .ck-editor__editable s,
                .ck-editor__editable strike,
                .ck-editor__editable del {
                    font-size: inherit !important;
                    line-height: inherit !important;
                    text-decoration: line-through !important;
                }
                /* Fix subscript and superscript sizing */
                .ck-editor__editable sub,
                .ck-editor__editable sup {
                    font-size: 0.85em !important;
                    line-height: 0 !important;
                    vertical-align: baseline !important;
                    position: relative !important;
                }
                .ck-editor__editable sub {
                    bottom: -0.25em !important;
                }
                .ck-editor__editable sup {
                    top: -0.5em !important;
                }
                /* Fix code block sizing */
                .ck-editor__editable code,
                .ck-editor__editable kbd,
                .ck-editor__editable var {
                    font-size: inherit !important;
                    font-family: 'Courier New', monospace !important;
                    line-height: inherit !important;
                }
                .ck-editor__editable pre {
                    font-size: 13px !important;
                    line-height: 1.4 !important;
                    font-family: 'Courier New', monospace !important;
                    background-color: #f5f5f5 !important;
                    padding: 12px !important;
                    border-radius: 4px !important;
                    overflow-x: auto !important;
                }
                [data-bs-theme="dark"] .ck-editor__editable pre {
                    background-color: var(--bs-tertiary-bg) !important;
                }
                /* Blockquote styling */
                .ck-editor__editable blockquote {
                    font-size: inherit !important;
                    border-left: 4px solid #ccc !important;
                    padding-left: 16px !important;
                    margin: 12px 0 !important;
                    font-style: italic !important;
                    color: #666 !important;
                }
                [data-bs-theme="dark"] .ck-editor__editable blockquote {
                    border-left-color: var(--bs-border-color) !important;
                    color: var(--bs-secondary-color) !important;
                }
                /* Ensure all text maintains consistent sizing */
                .ck-editor__editable p,
                .ck-editor__editable li,
                .ck-editor__editable td {
                    font-size: 14px !important;
                    line-height: 1.6 !important;
                }
                /* Heading proper sizing */
                .ck.ck-editor__main > .ck-editor__editable h1 {
                    font-size: 2em !important;
                    margin: 0.5em 0 !important;
                }
                .ck.ck-editor__main > .ck-editor__editable h2 {
                    font-size: 1.75em !important;
                    margin: 0.5em 0 !important;
                }
                .ck.ck-editor__main > .ck-editor__editable h3 {
                    font-size: 1.5em !important;
                    margin: 0.5em 0 !important;
                }
                .ck.ck-editor__main > .ck-editor__editable h4 {
                    font-size: 1.25em !important;
                    margin: 0.5em 0 !important;
                }
                .ck.ck-editor__main > .ck-editor__editable h5 {
                    font-size: 1.1em !important;
                    margin: 0.5em 0 !important;
                }
                .ck.ck-editor__main > .ck-editor__editable h6 {
                    font-size: 1em !important;
                    margin: 0.5em 0 !important;
                }
                /* Ensure consistent text sizing across all content */
                .ck-editor__editable p,
                .ck-editor__editable li,
                .ck-editor__editable td,
                .ck-editor__editable span {
                    font-size: 14px !important;
                    line-height: 1.6 !important;
                }
                .ck.ck-editor__main > .ck-editor__editable h1,
                .ck.ck-editor__main > .ck-editor__editable h2,
                .ck.ck-editor__main > .ck-editor__editable h3,
                .ck.ck-editor__main > .ck-editor__editable h4,
                .ck.ck-editor__main > .ck-editor__editable h5,
                .ck.ck-editor__main > .ck-editor__editable h6 {
                    // margin: 0.5em 0 !important;
                }
                /* Toolbar wrapping */
                .ck.ck-toolbar {
                    flex-wrap: wrap !important;
                }
                .ck.ck-toolbar__separator {
                    height: 28px !important;
                }
                /* Ensure heading dropdown shows all options */
                .ck.ck-dropdown__panel {
                    max-height: 500px !important;
                    overflow-y: auto !important;
                }
                .ck.ck-list {
                    max-height: none !important;
                }
                .ck.ck-list__item {
                    min-width: 200px !important;
                    padding: 8px 12px !important;
                }
                /* Better spacing for dropdown items */
                [data-bs-theme="dark"] .ck.ck-list__item:last-child {
                    margin-bottom: 4px !important;
                }
                /* Table styling improvements */
                .ck-editor__editable table {
                    border-collapse: collapse !important;
                    margin: 12px 0 !important;
                }
                .ck-editor__editable table td,
                .ck-editor__editable table th {
                    border: 1px solid #ccc !important;
                    padding: 8px !important;
                    font-size: 14px !important;
                }
                [data-bs-theme="dark"] .ck-editor__editable table td,
                [data-bs-theme="dark"] .ck-editor__editable table th {
                    border-color: var(--bs-border-color) !important;
                }
                .ck-editor__editable table th {
                    background-color: #f5f5f5 !important;
                    font-weight: bold !important;
                }
                [data-bs-theme="dark"] .ck-editor__editable table th {
                    background-color: var(--bs-secondary-bg) !important;
                }
                /* List styling */
                .ck-editor__editable ul,
                .ck-editor__editable ol {
                    margin: 12px 0 !important;
                    padding-left: 24px !important;
                }
                .ck-editor__editable li {
                    margin: 4px 0 !important;
                }
                /* Link styling */
                .ck-editor__editable a {
                    color: #0056b3 !important;
                    text-decoration: underline !important;
                    cursor: pointer !important;
                }
                [data-bs-theme="dark"] .ck-editor__editable a {
                    color: #66b3ff !important;
                }
                /* Image sizing */
                .ck-editor__editable img {
                    max-width: 100% !important;
                    height: auto !important;
                    margin: 8px 0 !important;
                }
                /* Media embed responsive */
                .ck-editor__editable .media {
                    max-width: 100% !important;
                }
            `}</style>
      {isClient && (
        <CKEditor
          height={props.height || 700}
          editor={ClassicEditor}
          config={editorConfiguration}
          data={props.initialData || ""}
          onChange={(event, editor) => {
            const data = editor.getData();
            props.updatedata(event, data);
          }}
        />
      )}
    </div>
  );
}
