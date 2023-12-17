import React from 'react';
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

const editorConfiguration = {
    toolbar: [
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'link',
        'bulletedList',
        'numberedList',
        '|',
        'outdent',
        'indent',
        '|',
        'imageUpload',
        'blockQuote',
        'insertTable',
        'mediaEmbed',
        '|',
        'undo',
        'redo',
        '|',
        'fontBackgroundColor',
        'fontColor',
        '|',
        'alignment',
        'fontFamily',
        'fontSize',
        '|',
        'highlight',
        'subscript',
        'superscript',
        '|',
        'code',
        'codeBlock',
        'horizontalLine',
        '|',
        'removeFormat'
    ],
    image: {
        toolbar: [
            'imageTextAlternative',
            '|',
            'imageStyle:alignLeft',
            'imageStyle:full',
            'imageStyle:alignRight'
        ],
        styles: [
            'full',
            'alignLeft',
            'alignRight'
        ]
    },
    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells'
        ]
    },
    language: 'en', // Change this to your preferred language code
    fontSize: {
        options: [
            'tiny',
            'small',
            'default',
            'big',
            'huge'
        ]
    },
    fontFamily: {
        options: [
            'default',
            'Arial, Helvetica, sans-serif',
            'Courier New, Courier, monospace',
            'Georgia, serif',
            'Lucida Sans Unicode, Lucida Grande, sans-serif',
            'Tahoma, Geneva, sans-serif',
            'Times New Roman, Times, serif',
            'Verdana, Geneva, sans-serif'
        ]
    },
    alignment: {
        options: [
            'left',
            'center',
            'right',
            'justify'
        ]
    },
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
        ]
    }
};


export default function MARKDOWN_EDITOR( props ) {
        return (
            <CKEditor
            editor={ClassicEditor}
                config={ editorConfiguration }
                data={ props.initialData || ''}
                onChange={ (event, editor ) => {
                    const data = editor.getData();
                    props.updatedata(event,data)
                } }
            />
        )
}

