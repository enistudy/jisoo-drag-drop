import React from "react";
import Draggable from "./Draggable";

import { useDroppable } from "react-useful-dnd";

function DropZone({ id, datas }) {
	const [dropZoneId, droppableRef, dataList] = useDroppable({
		id,
		items: datas
	});

	return (
		<div className="DropZone-Wrapper">
			<div id={dropZoneId} ref={droppableRef}>
				{datas.map(data => (
					<Draggable key={data} data={data} />
				))}
			</div>
			<div className="State-Dashboard">{dataList.join(" / ")}</div>
		</div>
	);
}

export default DropZone;
