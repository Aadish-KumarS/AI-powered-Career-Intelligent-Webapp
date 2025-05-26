from pydantic import BaseModel, Field
from typing import List, Optional


class Node(BaseModel):
    id: str
    title: str
    description: str
    prerequisites: List[str] = []


class Edge(BaseModel):
    source: str
    target: str


class Roadmap(BaseModel):
    title: str
    description: str
    nodes: List[Node]
    edges: List[Edge]
    user_id: Optional[str] = None  # Optional if user-based saving is added
