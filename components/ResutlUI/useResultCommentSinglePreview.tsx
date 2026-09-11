

import { ResultSettings } from "../ResultView/result-settings";

export default function UseResultCommentSinglePreview({ comments, resultsettings }: { comments: string; resultsettings?: ResultSettings | null }) {
	const style = resultsettings?.comments;
	const hasComments = comments && comments.toString().trim().length > 0;

	return (
		<div>
			{hasComments && (style?.showHeading ?? true) && (
				<div className="fw-bold" style={{ color: style?.headingColor || 'black' }}>Comments</div>
			)}
			{hasComments && (
				<div
					style={{
						fontFamily: style?.fontFamily,
						fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
						color: style?.color || 'black',
						backgroundColor: style?.backgroundColor || 'transparent',
						fontStyle: style?.fontStyle || 'normal',
						fontWeight: style?.fontWeight || 'normal',
						textAlign: style?.textAlign || 'left',
					}}
					dangerouslySetInnerHTML={{ __html: comments }}
				/>
			)}
		</div>
	)
}

