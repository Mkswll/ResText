export class BSTNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.left = null; // left child initialized as null
        this.right = null; // right child initialized as null
    }
}

export class BST {
    /* constructor to initialize an empty BST */
    constructor() {
        this.root = null;
        this.size = 0;
    }

    /* creates and inserts  BST node with specified key and value */
    insert(key, value) {
        this.size++;
        var newNode = new BSTNode(key, value);

        if (this.root == null) {
            // sets the node as the root if the BST is empty
            this.root = newNode;
        } else {
            // otherwise key > curNode.key (guaranteed by random ID generation)
            var curNode = this.root;
            while (true) {
                if (key < curNode.key) {
                    if (curNode.left == null) {
                        curNode.left = newNode;
                        return;
                    } else {
                        curNode = curNode.left;
                    }
                } else {
                    // otherwise key > curNode.key (guaranteed by random ID generation)
                    if (curNode.right == null) {
                        curNode.right = newNode;
                        return;
                    } else {
                        curNode = curNode.right;
                    }
                }
            }
        }
    }

    /* searches for the node with the specified key */
    search(key) {
        var curNode = this.root;
        while (curNode != null) {
            if (key == curNode.key) {
                break;
            } else if (key < curNode.key) {
                curNode = curNode.left;
            } else {
                curNode = curNode.right;
            }
        }
        return curNode.value;
    }

    /* clears the BST for reuse */
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

    /* sets another node to be this node’s child */
    addChild(node) {
        this.children.push(node);
        node.parent = this;
    }

    /* sets another node to be this node’s parent */
    setParent(node) {
        node.children.push(this);
        this.parent = node;
    }

    /* sets another node to be this node’s adjacent node */
    addAdjacent(node) {
        this.adjacents.push(node);
    }
}

export class Tree {
    constructor() {
        this.root = null;
        this.size = 0;
        this.adj = {}; // adjacency list for storing the undirected tree
        this.nodes = {}; // an object mapping values into TreeNodes
    }

    setRoot(node) {
        this.root = node;
    }

    setRootbyValue(value) {
        this.size++;
        if (this.nodes[value] == null) {
            this.nodes[value] = new TreeNode(value); // creates a new node if no existing node has the specified value
        }
        this.setRoot(this.nodes[value]);
    }

    addEdge(node1, node2) {
        node1.addAdjacent(node2);
        node2.addAdjacent(node1);
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
            if (node == curNode.parent) continue;
            curNode.addChild(node);
            this.dfs(node);
        }
    }

    /* builds the tree by running a DFS from the root, classifying each node’s adjacent nodes into its children and parent */
    build() {
        this.size = 0;
        if (this.root == null) return;
        this.dfs(this.root);
    }

    /* clears the version tree for reuse */
    clear() {
        this.root = null;
        this.nodes = {};
        this.size = 0;
    }
}
