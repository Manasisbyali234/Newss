import React, { useRef, useEffect } from 'react';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = "Enter text...", className = "" }) => {
    const editorRef = useRef(null);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const handleCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current.focus();
        handleContentChange();
    };

    const handleContentChange = () => {
        if (editorRef.current && onChange) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.execCommand('insertHTML', false, '<br><br>');
            handleContentChange();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        handleContentChange();
    };

    return (
        <div className={`rich-text-editor ${className}`}>
            <div className="editor-toolbar">
                <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => handleCommand('bold')}
                    title="Bold"
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => handleCommand('italic')}
                    title="Italic"
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => handleCommand('underline')}
                    title="Underline"
                >
                    <u>U</u>
                </button>
                <div className="toolbar-separator"></div>
                <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => handleCommand('insertUnorderedList')}
                    title="Bullet List"
                >
                    •
                </button>
                <div className="toolbar-separator"></div>
                <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => handleCommand('justifyLeft')}
                    title="Align Left"
                >
                    ⬅
                </button>
                <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => handleCommand('justifyCenter')}
                    title="Align Center"
                >
                    ↔
                </button>
                <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => handleCommand('justifyRight')}
                    title="Align Right"
                >
                    ➡
                </button>
            </div>
            <div
                ref={editorRef}
                className="editor-content"
                contentEditable
                onInput={handleContentChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                data-placeholder={placeholder}
                suppressContentEditableWarning={true}
            />
        </div>
    );
};

export default RichTextEditor;