import React from "react";
import "./App.css";

import DropZone from "./DropZone";

const firstItem = [1, 2, 3, 4, 5];
const secondItem = [6, 7, 8, 9, 10];

function App() {
	return (
		<>
			<h1 className="Title">Drag & Drop Example page</h1>
			<div className="Dnd-Wrapper">
				<DropZone id={"first"} datas={firstItem} />
				<DropZone id={"second"} datas={secondItem} />
			</div>
		</>
	);
}

export default App;
