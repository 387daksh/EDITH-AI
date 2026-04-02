import ast
import os
import networkx as nx
from typing import List, Dict

class DependencyGraph:
    def __init__(self):
        self.graph = nx.DiGraph()
        
    def parse_imports(self, file_path: str, repo_root: str):
        """
        Parses a python file to find its imports and adds edges to the graph.
        """
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                tree = ast.parse(f.read(), filename=file_path)
        except Exception:
            return # Skip if parse fails

        rel_path = os.path.relpath(file_path, repo_root).replace("\\", "/")
        self.graph.add_node(rel_path)
        
        for node in ast.walk(tree):
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                # Determine the target module
                target = None
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        target = alias.name
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        target = node.module
                        
                if target:
                    # Naive internal resolution: if target matches a file in repo
                    # In a real system, you'd verify the file exists on disk.
                    # For now, we assume if it starts with 'backend' or similar, it's internal.
                    # Or simpler: store the edge 'rel_path -> target'
                    self.graph.add_edge(rel_path, target)

    def get_dependencies(self, file_path: str) -> List[str]:
        """Returns list of files that this file imports."""
        if file_path in self.graph:
            return list(self.graph.successors(file_path))
        return []

    def get_dependents(self, file_path: str) -> List[str]:
        """Returns list of files that import this file."""
        if file_path in self.graph:
            return list(self.graph.predecessors(file_path))
        return []

    def save(self, path: str):
        nx.write_gml(self.graph, path)

    def load(self, path: str):
        if os.path.exists(path):
            self.graph = nx.read_gml(path)

    def to_mermaid(self) -> str:
        """Converts the graph to Mermaid.js Flowchart syntax."""
        mermaid = ["graph TD"]
        
        # Add nodes (files)
        # We can style them based on extension if we want, but for now simple ids
        # Mermaid IDs cannot have slashes/dots easily, so we hash or sanitize them
        
        node_map = {}
        
        for i, node in enumerate(self.graph.nodes()):
            safe_id = f"node{i}"
            node_map[node] = safe_id
            # Escaping label
            label = node.replace('"', "'")
            mermaid.append(f'    {safe_id}["{label}"]')
            
        # Add edges
        for u, v in self.graph.edges():
            if u in node_map and v in node_map:
                mermaid.append(f"    {node_map[u]} --> {node_map[v]}")
                
        return "\n".join(mermaid)
