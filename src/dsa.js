export class BSTNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

export class BST {
    constructor() {
        this.root = null;
        this.size = 0;
    }

    insert(key, value) {
        this.size++;
        var newNode = new BSTNode(key, value);
        if (this.root == null) {
            this.root = newNode;
        } else {
            this.insertNode(this.root, newNode);
        }
    }

    insertNode(curNode, newNode) {
        if (newNode.key < curNode.key) {
            if (curNode.left == null) {
                curNode.left = newNode;
            } else {
                this.insertNode(curNode.left, newNode);
            }
        } else {
            if (curNode.right == null) {
                curNode.right = newNode;
            } else {
                this.insertNode(curNode.right, newNode);
            }
        }
    }

    search(key) {
        // console.log(key);
        return this.searchValue(this.root, key);
    }

    searchValue(curNode, key) {
        if (curNode == null) {
            return null;
        } else if (key == curNode.key) {
            return curNode.value;
        } else if (key < curNode.key) {
            return this.searchValue(curNode.left, key);
        } else {
            return this.searchValue(curNode.right, key);
        }
    }

    clear() {
        this.root = null;
        this.size = 0;
    }
}

export class TreeNode {
    constructor(value) {
        this.value = value;
        this.adjacents = [];
        this.children = [];
        this.parent = null;
    }

    addChild(node) {
        this.children.push(node);
        node.parent = node;
    }

    setParent(node) {
        node.children.push(this);
        this.parent = node;
    }

    addAdjacent(node) {
        this.adjacents.push(node);
    }
}

export class Tree {
    constructor() {
        this.root = null;
        this.size = 0;
        this.adj = {}; // adjacency list for storing the undirected tree
        this.nodes = {};
    }

    setRoot(node) {
        this.root = node;
    }

    setRootbyValue(value) {
        if (this.nodes[value] == null) {
            this.nodes[value] = new TreeNode(value);
        }
        this.setRoot(this.nodes[value]);
    }

    addEdge(node1, node2) {
        node1.addAdjacent(node2);
        // node2.addAdjacent(node1);
    }

    addEdgebyValues(value1, value2) {
        if (this.nodes[value1] == null) {
            this.nodes[value1] = new TreeNode(value1);
        }
        if (this.nodes[value2] == null) {
            this.nodes[value2] = new TreeNode(value2);
        }
        this.addEdge(this.nodes[value1], this.nodes[value2]);
    }

    dfs(curNode) {
        this.size++;
        for (const node of curNode.adjacents) {
            if (node == null || node.value == "") continue;
            if (node == curNode.parent) {
                continue;
            }
            curNode.addChild(node);
            this.dfs(node);
        }
    }

    build() {
        this.size = 0;
        if (this.root == null) return;
        this.dfs(this.root);
    }

    clear() {
        this.root = null;
        this.nodes = {};
        this.size = 0;
    }
}
