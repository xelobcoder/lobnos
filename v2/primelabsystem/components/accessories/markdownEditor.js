import React, { useEffect } from 'react';
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

const editorConfiguration = {
    toolbar: [
        'heading',
        '|',
        'bold',
        'italic',
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
        'undo',
        'redo',
    ]
};

editorConfiguration.mediaEmbed = {
    previewsInData: true
};

editorConfiguration.language = 'en';

export default function MARKDOWN_EDITOR(props) {
    const [isClient, setIsClient] = React.useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    return (
        <div>
            {isClient && <CKEditor
                height={props.height || 700}
                editor={ClassicEditor}
                config={editorConfiguration}
                data={props.initialData || ''}
                onChange={(event, editor) => {
                    const data = editor.getData();
                    props.updatedata(event, data)
                }}
            />}
       </div>
    )
}

