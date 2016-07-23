/*
JSAT = require('jsaturday_factory')({
	profiling:{
		default: {
			BackEnd: {
				b: 3
			}
		}
	}	
});

JSAT.loadModule(require('./index.js'));

var profile = JSAT.get('profiling');
profile.settings.a = 1;
console.log(profile.settings);

*/


function Tree(settings){
	var self = this;

	if(!settings)
		settings = {};

	var cache = {};
	function cleanCache(){
		cache = {
			up : {},
			down: {},
		};
	}

	if(settings.TTL){
		setInterval(function(){
			cleanCache();
		}, settings.TTL * 1000);
	}

	var nodes = {};	
	this.initialized = false;

	this.addNode = function(node){
		if(!node._id)
			throw new Error('Missing _id for node ' + node);

		if(node._children)
			throw new Error('_children field is not allowed.');

		if(!node._parent)
			node._parent = 'ROOT';

		if(node._id === 'ROOT'){
			delete node._parent;
		}

		this.initialized = false;		

		nodes[node._id] = node;
	};

	this.initialize = function(){

		// Reset cache
		cleanCache();

		function _addChildren(nodeId, idParent){
			if(!nodes[nodeId] || !nodes[idParent]){
				return;
			}
			var parent = nodes[idParent];
			if(!parent._children){
				parent._children = [];
			}
			parent._children.push(nodeId);
		}

		var id;

		for(id in nodes)
			delete nodes[id]._children;

		for(id in nodes){
			var node = nodes[id];
			if(node._parent)
				_addChildren(id, node._parent);
		}

		self.initialized = true;

	};

	this.getAll = function(){
		if(!self.initialized)
			self.initialize();

		return nodes;
	};

	this.getUp = function(nodeId){
		if(!nodeId)
			throw new Error('Missing nodeId');

		if(!nodes[nodeId])
			throw new Error('Node ' + nodeId + ' not found!');

		if(cache.up[nodeId]){
			console.log("CACHED!");
			return cache.up[nodeId];
		}

		var up = [];
		function _getUp(id){
			up.push(id);
			var parentId = nodes[id]._parent || null;
			if(parentId)
				_getUp(parentId);
		}

		_getUp(nodeId);

		if(settings.TTL)
			cache.up[nodeId] = up;

		return up;
	};

	this.getDown = function(nodeId){
		if(!nodeId)
			throw new Error('Missing nodeId');

		if(!nodes[nodeId])
			throw new Error('Node ' + nodeId + ' not found!');

		if(cache.down[nodeId]){
			console.log("CACHED!");
			return cache.down[nodeId];
		}

		var down = [];
		function _getDown(id){
			down.push(id);

			if(!nodes[id]._children)
				return;

			for(var i = 0; i < nodes[id]._children.length; i++){
				_getDown(nodes[id]._children[i]);
			}
		}

		_getDown(nodeId);

		if(settings.TTL)
			cache.down[nodeId] = down;

		return down;
	};

}


var t = new Tree({TTL: false});
t.addNode({_id: "ROOT",});
t.addNode({_id: "NODE", name: "CIAO"});
t.addNode({_id: "NODE1", name: "CIAO1", _parent: "NODE"});
t.addNode({_id: "NODE2", name: "CIAO1", _parent: "NODE"});
t.addNode({_id: "NODE3", name: "CIAO1", _parent: "NODE1"});

console.log(t.getAll());
console.log(t.getDown('ROOT'));
console.log(t.getDown('ROOT'));
console.log(t.getDown('ROOT'));
console.log(t.getDown('ROOT'));

setTimeout(function(){
	console.log(t.getDown('ROOT'));	
	console.log(t.getDown('ROOT'));	
	console.log(t.getDown('ROOT'));	
}, 5000);


