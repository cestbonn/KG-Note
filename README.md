# KG-Note
A notebook should be designed as a graph, not in a tree or sequential fashion. The latter seriously lacks adaptability and can convey only limited information. For people who have numerous ideas in mind but are poor at memorizing, a graph-centric note system lets them pin down nodes whenever and wherever inspiration strikes, linking back to previous sparks effortlessly.

*I'm a machine learning guy who know nothing about web design so this project is 90\% powered by GPT. The start point is that I want a tool to help with my bad memory during reading :\)*

## :thinking: Plan
1. Build an interactive graph.
2. Connect two nodes interactively.
3. Extract basic info from PDF and html.
4. Extract citations from PDF or source.
5. Interact with the PDF.
6. Implement LLM for searching similar ideas and drawing conclusions.

## :hammer_and_wrench: Install 
This project is based on Flask \(backend\) and React \(frontend\).
- Step 1. Run Flask. [tutorial](https://code.visualstudio.com/docs/python/tutorial-flask)
```command line
python app.py
```
- Step 2. Create a React project. [tutorial](https://code.visualstudio.com/docs/nodejs/reactjs-tutorial)
```cmd
npx create-react-app my-app
```
- Step 3. Replace files in `src` to `my-app/src`.
- Step 4. ~~Enjoy!~~
```cmd
npm start
```
## :white_check_mark: Features 
1. Create node and link with input box quickly with suggestion.
2. Create dest node from a source node quickly with `Tab`.
3. A sliding bar to highlight links and nodes based on their creating date.
