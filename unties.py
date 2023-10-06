import networkx as nx
import matplotlib.pyplot as plt

ColorMapping = {'paper': 'red', 'person': 'purple', 'statement': 'green',
                'thought': 'yellow'}  # Example mapping

class Brain:
    def __init__(self) -> None:
        self.kg = nx.DiGraph()

    def add(self, meta):
        src, relation, dest, write_date = meta
        src_type, relation, dest_type = relation.split('-')
        self.kg.add_node(src, type=src_type)
        self.kg.add_node(dest, type=dest_type)
        self.kg.add_edge(src, dest, relation=relation, write_date=write_date)
    
    def add_from_db(self, meta):
        (src, src_type), relation, (dest, dest_type), write_date = meta
        self.kg.add_node(src, type=src_type)
        self.kg.add_node(dest, type=dest_type)
        self.kg.add_edge(src, dest, relation=relation, write_date=write_date)

    def to_json(self):
        return {
            "nodes": [{"id": node, "type": self.kg.nodes[node]["type"], "color": ColorMapping.get(self.kg.nodes[node]["type"])} for node in self.kg.nodes()],
            "links": [{"source": edge[0], 
                       "target": edge[1], 
                       "relation": self.kg[edge[0]][edge[1]]["relation"],
                       "write_date": self.kg[edge[0]][edge[1]]["write_date"]} for edge in self.kg.edges()]
        }
    
    def clear(self):
        self.kg.clear()