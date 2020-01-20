# 🌈 drag & drop 모듈 NPM에 등록해보기!!

### [👏 라이브러리 구현 repository 바로가기](https://github.com/YukJiSoo/react-useful-dnd)

<br>

## ❓ npm 등록?

npm에 등록하기위해 어떤 것을 준비해야 하는지 조사해보았습니다. 저는 우선 폴더구조를 어떤식으로 구성해야 하는지부터 정하고 시작했습니다. 서칭을 통해 보통많이 사용하는 것 같은 구조로 구성하여 진행했습니다.

```bash
├── build          # 번들링 된 파일이 저장되는 디렉토리
├── config         # 번들링 관련 webpack config 파일
├── example        # 예제 코드
├── lib            # 라이브러리 구현과 관련된 코드 디렉토리
├── package.json
└── .npmignore
```

npm 배포를 위한 `package.json` 파일은 아래 사이트를 참고하여 작성했습니다.

### 📝 참고사이트

- https://heropy.blog/2019/01/31/node-js-npm-module-publish/
- https://blog.outsider.ne.kr/829

배포될 라이브러리를 번들링하지 않아도 가능하지만 라이브러리 내부적으로 uuid 모듈을 사용하고 있었기 때문에 번들링해서 npm에 등록하는 것이 사용하는 개발자의 입장에서 더 편하게 이용할 수 있을 것이라고 생각했습니다.

다음과 같이 config파일을 구성했습니다.

```javascript
// webpack.config.library.js

const path = require("path");

module.exports = {
	mode: "production",
	entry: ["@babel/polyfill", "./lib/index.js"],
	output: {
		path: path.resolve(__dirname, "..", "build"),
		filename: "react-useful-dnd.js",
		library: "reactUsefulDnd",
		libraryTarget: "umd"
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ["babel-loader"]
			}
		]
	},
	externals: {
		react: {
			commonjs: "react",
			commonjs2: "react",
			amd: "react",
			root: "react"
		}
	}
};
```

`react-useful-dnd`에서 제공하는 모듈을 모아놓은 index파일을 entry로 설정해주었습니다.

눈여겨 보아할 부분은 output과 externals입니다.

externals 속성은 번들링시 해당 파일을 포함시키지 않도록 합니다. react를 명시해주어 번들파일의 사이즈가 커지는 것을 방지했습니다.
output의 libraryTarget은 해당 모듈이 어떤방식으로 로드될지를 결정하는 속성입니다. umd로 설정해주어 script뿐아니라 amd, commonjs 방식으로 로드가 가능합니다. library속성으로 전역 범위에 할당될 변수 또는 네임스페이스명을 설정할 수 있습니다.

아래 사이트를 참고하여 작성했습니다.

### 📝 참고사이트

- https://kishu.gitbooks.io/webpack/
- https://ui.toast.com/weekly-pick/ko_20170818/
- https://webpack.js.org/guides/author-libraries/#author-a-library

<br>

## ❓ drag & drop API

drag & drop에 대한 정보는 MDN문서가 가장 정리가 잘 되어 있었습니다.

### 📝 참고사이트

- https://developer.mozilla.org/ko/docs/Web/API/HTML_드래그_앤_드롭_API

`react-useful-dnd` 라이브러리를 구현하면서 drag 가능한 요소, drop할 수 있는 요소만 구성하여 제공하면 간단하면서 유용한 drag & drop 라이브러리가 될 것으로 생각했습니다.

이를 react에서 편하게 사용하기위해 hooks로 제공하기로 했습니다. 두 hooks에서는 모두 ref를 반환하며 원하는 element에 ref props를 부여하여 직접 event를 등록해주었습니다.

<br>

### `🎇 useDraggable`

component가 drag 가능한 요소가 되도록 해주는 hooks입니다.

`dragstart`와 `dragend` 이벤트에 리스너를 등록해주었습니다.

해당 컴포넌트를 드래그 시작하면 `Is-Dragging`이라는 클래스이름을 부여하고 드래그가 끝나면 해당 클래스이름을 제거해주는 단순한 역할을 합니다.

<br>

### `🌁 useDroppable`

component가 drop 가능한 요소가 되도록 해주는 hooks입니다.

`dragover`, `dragleave`, `dragend` 이벤트에 리스너를 등록해주었습니다.

해당 컴포넌트에 드래그 중인 요소가 지나가면 위치를 계산하여 dropzone에 추가시켜줍니다. dropzone영역을 빠져나가면 없애주도록 합니다. 이때, `display: none` 속성을 부여하여 단순히 화면에 보이지 않도록 해주었기 때문에 드래그가 끝난 시점에서 화면에 보이지는 않지만 dom트리에 존재하는 모든 element를 없애주도록했습니다.

<br>

### 🙉 상태관리

dom에 직접 접근하여 위치를 변경해주기 때문에 초기에 넘겨준 dropzone내부의 data의 순서변경, 새로운 데이터 추가, 데이터 삭제의 경우 상태를 따로 관리할 필요가 있다고 생각했습니다.

다음과 같이 `useDroppable` hooks에서 props로 items라는 내부요소를 넘겨받아 hooks자체적으로 state를 생성하여 관리해주도록 했습니다. 그리고 해당 state를 반환하여 외부에서 state의 변경에 따라 조작할 수 있도록 의도했습니다.

```js
function useDroppable({ id = uuid(), items }) {
	const [dataList, setDataList] = useState(
		items.map(item => ({ data: item, id: uuid() }))
    );
    const droppableRef = useRef(null);

    ...

    return [id, droppableRef, dataList.map(({ data }) => data)];
}
```

외부에서는 다음과 같이 사용합니다. hooks를 호출할때 초기 데이터를 인자로 넘겨주고, 반환받은 새로운 state인 `dataList`는 돔의 변경에 따라 같이 변경되기 때문에 돔과 state의 동기화 효과를 이끌어 내도록 했습니다.

내부적으로 dropzone내부 요소의 순서변경과 추가 `dragover`에서, 삭제는 `dragleave`에서 이루어집니다.

```javascript
import React from "react";
import { useDraggable } from "react-useful-dnd";
import Draggable from "Draggable";

function DropZone({ id, datas }) {
	const [dropZoneId, droppableRef, dataList] = useDroppable({
		id,
		items: datas
	});

	return (
		<div id={dropZoneId} ref={droppableRef}>
			{datas.map(data => (
				<Draggable key={data} data={data} />
			))}
		</div>
	);
}

export default DropZone;
```

추후에, 내부요소의 위치변경 / 삭제 / 추가에 따른 콜백을 hooks의 인자로 넘겨주어 세부적인 조작이 가능하도록 하면 좋을 것으로 생각합니다.

<br>

## ❓ 어려웠던 점

초기에 hooks를 제공하는 라이브러리를 구현하고자 계획하였고 ref를 사용하여 조작하면 편하게 할 수 있을 것이라 생각했습니다. 구현을 진행하다 보니 돔에 직접 접근하는 코드가 많아지게 되었고, 정신차리고 보니 돌이킬 수 없을 정도였습니다. 애초에 state기반으로 구현하였으면 어땠을까 생각도 했지만 이미 멀리 걸어왔기 때문에 구현을 계속해서 진행해갔습니다.

돔조작 만으로 구현하는 것은 까다로운 부분이 많지는 않았지만, 돔이 변경됨에 따라서 state 또한 동기화 되어야 하기 때문에 이 부분을 처리하는 것에 있어서 많이 애먹었습니다. 결국 state가 변경되어야 하는 event마다 dropzone의 childnode에 접근하여 state를 갱신해주는 형식으로 구현했습니다.
