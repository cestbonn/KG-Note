import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ForceGraph2D from 'react-force-graph-2d';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './App.css';

const InputWithSuggestion = ({ placeholder, value, onChange, onKeyDown, getSuggestion }) => (
  <div className="input-group">
    <input className="suggestion-input" value={value + getSuggestion()} disabled />
    <input
      className="user-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  </div>
);

const NodeAddPopup = ({ src, srcType, onClose, onSubmit, data, handleInputChange, getSuggestedValue, position }) => (
  <div className="node-add-popup" style={{ left: position.x + 'px', top: position.y + 'px' }}>
    <div>
      <strong>Source:</strong> {src} ({srcType})
    </div>
    {['relation', 'dest', 'destType'].map(field => (
      <InputWithSuggestion
        key={field}
        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
        value={data[field]}
        onChange={(e) => handleInputChange(e, field)}
        onKeyDown={(e) => {
          const suggestion = getSuggestedValue(data[field], field);
          if (e.key === "Tab" && suggestion) {
            e.preventDefault();
            handleInputChange({ target: { value: data[field] + suggestion }}, field);
          } else if (e.key === 'Enter') {
            onSubmit(src, srcType);
            onClose();
          }
        }}
        getSuggestion={() => getSuggestedValue(data[field], field)}
      />
    ))}
    <button onClick={onClose}>Close</button>
  </div>
);

function App() {
  const [data, setData] = useState({
    src: '', srcType: '', relation: '', dest: '', destType: ''
  });
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [dateRange, setDateRange] = useState([new Date().toISOString(), new Date().toISOString()]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const graphRef = useRef(null);




  useEffect(() => {
    const fetchGraphData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/get-graph');
            setGraphData(response.data);
            const dates = response.data.links.map(link => new Date(link.write_date));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            setDateRange([minDate.toISOString(), maxDate.toISOString()]);
        } catch (error) {
            console.error('Error fetching initial graph data:', error);
        }
    };

    fetchGraphData();
  }, []);

  const handleInputChange = (e, field) => {
    setData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleClear = async () => {
    try {
        await axios.post('http://127.0.0.1:5000/clear');
        setGraphData({ nodes: [], links: [] });
    } catch (error) {
        console.error('Error clearing data:', error);
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  
    if (graphRef.current) {
      const { x, y } = graphRef.current.graph2ScreenCoords(node.x, node.y);
      setPopupPosition({ x, y });
    }
  };
  
  

  const handleBackgroundClick = () => {
    setSelectedNode(null);
  };

  const getSuggestedValue = (input, field) => {
    if (!input) return '';
    const valuesMap = {
      src: graphData.nodes.map(node => node.id),
      dest: graphData.nodes.map(node => node.id),
      srcType: [...new Set(graphData.nodes.map(node => node.type))],
      destType: [...new Set(graphData.nodes.map(node => node.type))],
      relation: [...new Set(graphData.links.map(link => link.relation))]
    };
    const match = valuesMap[field].find(value => value.startsWith(input));
    return match ? match.substring(input.length) : '';
  };

  const handleDateRangeChange = (values) => {
    const [startDate, endDate] = values.map(value => new Date(value).toISOString());
    const filteredLinks = graphData.links.filter(link => {
      const date = new Date(link.write_date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
    setGraphData({
      ...graphData,
      links: graphData.links.map(link => ({
        ...link,
        isHighlighted: filteredLinks.includes(link)
      }))
    });
  };

  const handleAdd = async () => {
    try {
        const relationString = `${data.srcType}-${data.relation}-${data.destType}`;
        const response = await axios.post('http://127.0.0.1:5000/add', {
            src: data.src,
            relation: relationString,
            dest: data.dest,
            write_date: new Date().toISOString(),
        });
        setGraphData(response.data);
        setData({ src: '', srcType: '', relation: '', dest: '', destType: '' });
    } catch (error) {
        console.error('Error adding data:', error);
    }
  };

  const handleAddFromPopup = async (src, srcType) => {
    try {
      const relationString = `${srcType}-${data.relation}-${data.destType}`;
      const response = await axios.post('http://127.0.0.1:5000/add', {
        src,
        relation: relationString,
        dest: data.dest,
        write_date: new Date().toISOString(),
      });
      setGraphData(response.data);
      setData({ src: '', srcType: '', relation: '', dest: '', destType: '' });
    } catch (error) {
      console.error('Error adding data:', error);
    }
  };

  return (
    <div className="App">
      <div className="control-panel">
        {['src', 'srcType', 'relation', 'dest', 'destType'].map(field => (
          <InputWithSuggestion
            key={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={data[field]}
            onChange={(e) => handleInputChange(e, field)}
            onKeyDown={(e) => {
              const suggestion = getSuggestedValue(data[field], field);
              if (e.key === "Tab" && suggestion) {
                e.preventDefault();
                setData(prev => ({ ...prev, [field]: data[field] + suggestion }));
              }
            }}
            getSuggestion={() => getSuggestedValue(data[field], field)}
          />
        ))}
        <Slider range
          min={new Date(dateRange[0]).getTime()}
          max={new Date(dateRange[1]).getTime()}
          defaultValue={[new Date(dateRange[0]).getTime(), new Date(dateRange[1]).getTime()]}
          onAfterChange={handleDateRangeChange}
        />
        <div className="button-group">
          <button onClick={handleAdd}>Add</button>
          <button onClick={handleClear}>Clear</button>
        </div>
      </div>
      <div className="canvas">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel="id"
          linkLabel={(link) => link.relation}
          nodeColor={(node) => node.color}
          linkWidth={(link) => link.isHighlighted ? 5 : 2}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const isHighlighted = graphData.links.some(link => {
              const sourceId = link.source.id || link.source;
              const targetId = link.target.id || link.target;
              return link.isHighlighted && (sourceId === node.id || targetId === node.id);
            });
            const isSelected = selectedNode && node.id === selectedNode.id;

            ctx.beginPath();
            ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
            ctx.fill();
            if (isHighlighted || isSelected) {
              ctx.strokeStyle = isSelected ? 'pink' : 'darkblue';
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          }}
          onNodeClick={handleNodeClick}
          onBackgroundClick={handleBackgroundClick}
        />
      </div>
      {selectedNode && 
      <NodeAddPopup 
        src={selectedNode.id}
        srcType={selectedNode.type}
        onClose={() => setSelectedNode(null)}
        onSubmit={handleAddFromPopup}
        data={data}
        handleInputChange={handleInputChange}
        getSuggestedValue={getSuggestedValue}
        position={popupPosition}
      />
      }
    </div>
  );
}

export default App;
