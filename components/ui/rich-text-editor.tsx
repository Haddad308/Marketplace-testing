'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bold, Italic, Palette, Underline } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface RichTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

const colors = [
	'#000000',
	'#ffffff',
	'#ff0000',
	'#00ff00',
	'#0000ff',
	'#ffff00',
	'#ff00ff',
	'#00ffff',
	'#ffa500',
	'#800080',
	'#008000',
	'#ffc0cb',
	'#a52a2a',
	'#808080',
	'#000080',
];

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
	const editorRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (editorRef.current && editorRef.current.innerHTML !== value) {
			editorRef.current.innerHTML = value;
		}
	}, [value]);

	const handleInput = () => {
		if (editorRef.current) {
			onChange(editorRef.current.innerHTML);
		}
	};

	const executeCommand = (command: string, value?: string) => {
		document.execCommand(command, false, value);
		editorRef.current?.focus();
		handleInput();
	};

	const applyColor = (color: string) => {
		executeCommand('foreColor', color);
	};

	return (
		<div className={`rounded-md border border-gray-600 bg-gray-800 ${className}`}>
			{/* Toolbar */}
			<div className="flex items-center gap-1 border-b border-gray-600 p-2">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => executeCommand('bold')}
					className="h-8 w-8 p-0 hover:bg-gray-700"
				>
					<Bold className="h-4 w-4" />
				</Button>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => executeCommand('italic')}
					className="h-8 w-8 p-0 hover:bg-gray-700"
				>
					<Italic className="h-4 w-4" />
				</Button>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => executeCommand('underline')}
					className="h-8 w-8 p-0 hover:bg-gray-700"
				>
					<Underline className="h-4 w-4" />
				</Button>

				<Popover>
					<PopoverTrigger asChild>
						<Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-700">
							<Palette className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-48 border-gray-600 bg-gray-800 p-2">
						<div className="grid grid-cols-5 gap-1">
							{colors.map((color) => (
								<button
									key={color}
									type="button"
									className="h-8 w-8 rounded border border-gray-600 transition-transform hover:scale-110"
									style={{ backgroundColor: color }}
									onClick={() => applyColor(color)}
								/>
							))}
						</div>
					</PopoverContent>
				</Popover>
			</div>

			{/* Editor */}
			<div
				ref={editorRef}
				contentEditable
				onInput={handleInput}
				className="min-h-[120px] p-3 text-gray-100 focus:outline-none"
				style={{ wordBreak: 'break-word' }}
				data-placeholder={placeholder}
				suppressContentEditableWarning={true}
			/>

			<style jsx>{`
				[contenteditable]:empty:before {
					content: attr(data-placeholder);
					color: #6b7280;
					pointer-events: none;
				}
			`}</style>
		</div>
	);
}
