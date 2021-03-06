//console.log("TreeMapMod");
(function () {

    console.log("TreeMapMod - in function");

    var TreeMap = function (el, width, height) {
        var self = this;
        self.el = el;
        self.width = width;
        self.height = height - 25;
        self.treedata = {};
        self.treemap = {};
        self.tooltip = "";

        self.zoomTraceNode = [];
        self.xScale = d3.scale.linear().range([0, self.width]);
        self.yScale = d3.scale.linear().range([0, self.height]);

        console.log("TreeMap initialized");

        // Called from HTMLWidgets
        self.renderValue = function (el, treedata) {
            console.log("TreeMap renderValue");

            // Set init properties of the treedata set
            self.treedata = self.setTreeDataPropertiesRecurse(treedata);
            self.treedata.isZoomed = true;

            self.sortRecurse(treedata);
            self.root = treedata;

            // For debug
            // window.PmTreeDataRoot = self.root;
            // For debug


            // Set up the d3-treemap object
            self.treemap = d3.layout.treemap()
                //.mode('slice-dice')
                .padding(0)
                .round(true)
                .size([self.width, self.height])
                .value(function (d) {
                    return d.size;
                })
                .sort(self.sortComparator);
                //.sort(function (a, b) {
                //    return a.value - b.value;
                //    //return a.area - b.area;
                //});

            // Set up the bredcrum and insert the HTML-element
            self.bredcrum = d3.select(el).insert("div", '.chart');
            self.bredcrum.classed("bredcrum", true);


            // Insert the treemap HTML-element
            self.svg = d3.select(el)
                .classed('PmTreeMapD3', true)
                .style({ 'width': this.width + 'px', 'height': this.height + 25 + 'px' })
                .append("svg:svg")
                .attr("width", self.width)
                .attr("height", self.height)
                .append("svg:g")
                //.attr("transform", "translate(.5,.5) scale(0.25,0.25)")
                .attr("transform", "translate(.5,.5) scale(1,1)")
                .attr('class', 'zoomed cell');

            // Set up the tooltip and insert the HTML-element
            self.tooltip = d3.select(el).append("div");
            self.tooltip.classed("pm-tooltip", true);
            self.tooltip.append("h3");
            self.tooltip.append("h6");


            // Render the treemap and bredcrum
            self.render();
            self.updateBredCrum();

        };

        // Called from HTMLWidgets
        self.resize = function (el, width, height) {
            console.log("TreeMap resize");

        };

        /*
        * Render the tree map
        */
        self.render = function () {
            var nodes = self.treemap.nodes(self.root).filter(function (d) {
                return true;
            });
            var nodeParents = self.getParents(nodes);
            var topCell = self.defineParentCell(nodeParents);
            var cell = self.defineCell();
            var cellText = self.defineCellText(topCell);
            var cellText = self.defineCellText(cell);

            self.zoomTraceNode.push(self.root);

        }

        /*
        * Return the parent nodes, the nodes immediately below the top node
        */
        self.getParents = function (nodes) {
            var nodeParents = [];
            for (var i = 0; i < nodes.length; i++) {
                if (typeof nodes[i].parent !== "undefined" && typeof nodes[i].parent.parent === "undefined") {
                    nodeParents.push(nodes[i]);
                }
            }
            return nodeParents;
        }

        /*
        * Updates the tree nodes with some useful properties (label, isLeaf, isLoaded, isZoomed)
        * Calls itself recusivly
        */
        self.setTreeDataPropertiesRecurse = function (treeData) {
            //If data is an object
            if (Object.prototype.toString.call(treeData) === '[object Object]') {
                self.setTreeDataProperties(treeData);
                treeData.children = self.setTreeDataPropertiesRecurse(treeData.children);
            }
                //If data is an array
            else if ((Object.prototype.toString.call(treeData) === '[object Array]')) {
                treeData.forEach(function (d, i) {
                    self.setTreeDataProperties(d);
                    d.children = self.setTreeDataPropertiesRecurse(d.children);
                });
            }
            return treeData;
        }

        /*
        * Updates the tree nodes with some useful properties (label, isLeaf, isLoaded, isZoomed)
        */
        self.setTreeDataProperties = function (node) {
            //If data is an object- should be an object
            if (Object.prototype.toString.call(node) === '[object Object]') {
                //Set the label
                if (typeof node.label === "undefined") {
                    node.label = node.name;
                }

                //Fix the name
                node.name = self.replaceAll([" ", ".", ","], "_", node.name);


                //Set the isLeafStatus
                node.isLeaf = false;
                if (typeof node.children === "undefined" || node.children.length === 0) {
                    node.isLeaf = true;
                }
                //Set the isLoaded
                node.isLoaded = false;

                //Set the isZoomed
                node.isZoomed = false;
            }
            else {
                console.log("setTreeDataProperties: argument not an object");
            }

            return node;
        }

        /*
        * Updates the tree data with sort order property
        * Calls itself recusivly
        */
        self.sortRecurse = function (data) {
            data.children.sort(self.sortComparator);
            for (var i = 0; i < data.children.length; i++) {
                data.children[i].order = i + 1;
                self.sortRecurse(data.children[i]);
            };
        }

        /*
        * Updates the tree data with sort order property
        * Calls itself recusivly
        */
        self.sortComparator = function (a, b) {
            return a.size - b.size !== 0 ? a.size - b.size : a.name.localeCompare(b.name);
        }

        /*
        * Clears the property isZoomed of the node/or aray of nodes and its/their children
        */
        self.clearIsZoomedRecurse = function (treeData) {
            //If data is an object
            if (Object.prototype.toString.call(treeData) === '[object Object]') {
                treedata.isZoomed = false;
                treeData.children = self.clearIsZoomedRecurse(treeData.children);
            }
                //If data is an array
            else if ((Object.prototype.toString.call(treeData) === '[object Array]')) {
                treeData.forEach(function (d, i) {
                    d.isZoomed = false;
                    d.children = self.clearIsZoomedRecurse(d.children);
                });
            }
            return treeData;
        }

        /*
        * Insert and set up the cells corresponding to the parent nodes
        */
        self.defineParentCell = function (nodeParents) {
            var cells = this.svg.selectAll('g.topCell')
                .data(nodeParents)
                .enter().append("svg:g")
                .attr('class', function (d) {
                    //return "topCell order_" + d.order;
                    return "cell " + self.getOrderClass(d);
                })
                .attr('id', function (d) {
                    return d.name;
                })
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                })
                //.attr("data-type", function (d) { return d.name; })
                //.attr("data-value", function (d) { return d.value; })
                .on("click", function (d) {
                    // Since this is the top level, do nothing.
                    if (d3.event.ctrlKey) {
                        //return self.zoomOut(d);
                    }
                    else {
                        return self.zoomIn(d, this);
                    }
                })
                // Add the class active when hovering over top nodes.
                .on('mouseover', function (d) { d3.select(this).classed('active', true) })
                .on('mouseout', function (d) { d3.select(this).classed('active', false) })
                // Add tooltip events
                .on('mousemove', function (d) {
                    self.updateToolTip(d, this);
                })
                .on('mouseleave', function (d) {
                    self.tooltip.style("display", "none");
                });


            // Append rect elements to the cells
            cells.append("svg:rect")
                .attr("width", function (d) { return Math.round(d.dx); })
                .attr("height", function (d) { return Math.round(d.dy); })
                .attr('class', function (d) {
                    return self.getOrderClass(d);
                });

            return cells;

        }

        /*
        * Insert and set up the cells corresponding to the node
        */
        self.defineCell = function () {
            var cell = self.svg.selectAll('g.cell').selectAll('g.cell')
                .data(function (d) {
                    //console.log('Adding ' + d.children.length + ' children!')
                    return d.children;
                })
                .enter().append('svg:g')
                .attr('class', function (d) {
                    return "cell " + self.getOrderClass(d);
                })
                .attr('id', function (d) {
                    return d.name;
                })
                .attr("transform", function (d) {
                    if (d.parent.isZoomed) {
                        return "translate(" + d.x + "," + d.y + ")";
                    }
                    else {
                        var x = d.x - d.parent.x;
                        var y = d.y - d.parent.y;
                        return "translate(" + x + "," + y + ")";
                    }
                })
                .attr("stroke", "white")
                .attr("stroke-width", "0.5")
                .attr("vector-effect", "non-scaling-stroke");
            //.attr("data-type", function (d) { return d.name; })
            //.attr("data-value", function (d) { return d.value; })
            // Append rect elements to the cells
            cell.append("svg:rect")
                .attr("width", function (d) { return Math.round(d.dx); })
                .attr("height", function (d) { return Math.round(d.dy); })
                .attr('class', function (d) {
                    return self.getOrderClass(d);
                });

            return cell;
        }

        /*
        * Insert and set up the cells corresponding to a zoomed node
        */
        self.defineZoomCell = function (node) {

            var cells = self.svg.selectAll('g#' + node.name).selectAll('g');
            cells.data(node.children)

            .enter().insert('svg:g', "text")
            .attr('class', function (d) {
                return "cell " + self.getOrderClass(d);
            })
            .attr('id', function (d) {
                return d.name;
            })
            .attr("transform", function (d) {
                return "translate(" + Math.round(d.x) + "," + Math.round(d.y) + ")";
            })
            //.attr("data-type", function (d) {
            //    return d.name;
            //})
            //.attr("data-value", function (d) {
            //    return d.value;
            //})
            .attr("stroke", "white")
            .attr("stroke-width", function (d) {
                var stroke = d.parent.parent.area / self.root.area;
                return stroke;
            });

            // Append rect elements to the cells
            cells = self.svg.selectAll('g#' + node.name).selectAll('g');
            cells.append("svg:rect")
                .attr("width", function (d) {
                    return Math.round(d.dx);
                })
                .attr("height", function (d) {
                    return Math.round(d.dy);
                })
                .attr('class', function (d) {
                    //console.log("append rect to: " + d.name);
                    return self.getOrderClass(d);
                });

            return cells;
        }

        /*
        * Insert and set up the cell label corresponding to a cell
        */
        self.defineCellText = function (cell) {
            var cellText = cell.append("svg:text")
                .attr('class', 'node-label')
                .text(function (d) { return d.label; })
                .attr("transform", function (d) {
                    //var trans = "translate(" + d.dx / 2 + "," + d.dy / 2 + ") scale(1,1)";
                    var box = d3.select(this)[0][0].getBBox();
                    //trans = "translate(" + node.dx / 2 + "," + node.dy / 2 + ")";
                    var x = (d.dx - box.width) / 2;
                    var y = (d.dy - box.height) / 2
                    var trans = "translate(" + x + "," + y + ") scale(1,1)";
                    return trans;
                });
            //return this.abbrevText(cellText);
        }

        /*
        * Called to zoom in
        */
        self.zoomIn = function (zoomObj, element) {
            //Check if we are in a leaf node (or just above) then abort.
            if (zoomObj.isLeaf) {
                return;
            }

            //Check if node is already loaded
            if (!zoomObj.isLeaf && !zoomObj.isLoaded) {
                var nodes = self.treemap.nodes(self.root).filter(function (d) {
                    if (typeof d.parent !== "undefined" && d.parent.name === zoomObj.name) {
                        return true;
                    }
                    return false;
                });

                nodes.forEach(function (node, i) {
                    var a = node;
                    if (!node.isLeaf) {
                        var cell = self.defineZoomCell(node);
                        self.defineCellText(cell);
                    }

                });
                zoomObj.isLoaded = true;

            }
            self.zoomTraceNode.push(zoomObj);
            self.zoomCell(zoomObj);
        }

        /*
        * Called to zoom out
        */
        self.zoomOut = function (d) {
            var traceIndex = self.zoomTraceNode.indexOf(d);
            var traceLength = self.zoomTraceNode.length;
            var zoomOutElements = self.zoomTraceNode.slice(traceIndex, traceIndex + traceLength + 1).reverse();

            // Travers all zoomed elements and zoom
            zoomOutElements.forEach(function (v, i) {
                self.zoomCell(v, null);
            });

            // Update the bredcrum
            self.zoomTraceNode.splice(traceIndex + 1, traceLength);
            self.updateBredCrum();
        }

        /*
        * Zoom to a specified cell
        */
        self.zoomCell = function (zoomObj) {

            // Clear the zoomed flag of the object and its children
            zoomObj.isZoomed = true;
            self.clearIsZoomedRecurse(zoomObj.children);

            // Set transform transition
            var cells = self.svg.selectAll("g.cell, text.node-label").transition();
            cells
                .duration(d3.event.altKey ? 7500 : 750)
                .attr("transform", function (d, arg2, arg3) {
                    var elem = this;
                    var trans = self.getTransformString(elem, d, zoomObj);
                    return trans;
                });

            // Set fill color transition
            var cells2 = cells.transition()
            .attr("class", function (d) {
                var cssClass = "";
                var elem = this;
                if (elem.nodeName === "text" && self.hasClass(elem, 'node-label')) {
                    cssClass = "node-label";
                }
                else {
                    cssClass = "cell";
                    if (d.isZoomed) {
                        cssClass = cssClass + " zoomed";
                    }
                    if (d.isLeaf) {
                        cssClass = cssClass + " leaf";
                    }
                    cssClass = cssClass + " " + self.getOrderClass(d);
                }
                return cssClass;
            });

            // Set up events
            var cell = self.svg.selectAll("g.cell")
            .on("click", function (d, arg) {
                var a = "";
                if (d.parent.isZoomed && !d.isZoomed) {

                    if (d3.event.ctrlKey) {
                        if (typeof d.parent.parent !== "undefined") {
                            return self.zoomOut(d.parent.parent);
                        }
                    }
                    else {
                        return self.zoomIn(d, this);
                    }
                }
            })
            .on('mouseover', function (d) {
                if (d.parent.isZoomed && !d.isZoomed) {
                    d3.select(this).classed('active', true);
                }
            })
            .on('mouseout', function (d) { d3.select(this).classed('active', false) })
            .on('mousemove', function (d) {
                if (d.parent.isZoomed && !d.isZoomed) {
                    self.updateToolTip(d, this);
                }
            })
            .on('mouseleave', function (d) {
                if (d.parent.isZoomed && !d.isZoomed) {
                    self.tooltip.style("display", "none");
                }
            });

            //Update the breadcrum
            self.updateBredCrum();
            this.node = zoomObj;
            d3.event.stopPropagation();
        }

        /*
        * Zoom to a specified cell
        */
        self.updateBredCrum = function () {
            var zommedElements = self.svg.selectAll('.zoomed');
            var bredcrum = self.bredcrum.selectAll('span.bredcrum-node').data(self.zoomTraceNode);

            bredcrum.enter()
            .append("span")
            .text(function (d) {
                var a = "";
                return d.label;
            })
            .attr('class', 'bredcrum-node')
            .on("click", function (d, arg) {
                self.zoomOut(d);
            })
            .append("span")
            .attr('class', 'bredcrum-seperator');

            bredcrum.exit().remove();

            var bredcrumsep = self.bredcrum.selectAll('span.bredcrum-seperator')
            .text(function (d) {
                if (this.parentElement.nextSibling) {
                    return " -> ";
                }
                else {
                    return "";
                }
            });
        }

        /*
        * Calculates transform property of a cell, translate and scale and returns it as a string.
        */
        self.getTransformString = function (elem, node, zoomNode) {
            var scale, scaleString, trans;

            // If element is a cell label
            if (elem.nodeName === "text" && self.hasClass(elem, 'node-label')) {
                scale = self.getInverseScaleParents(node, zoomNode);
                var box = d3.select(elem)[0][0].getBBox();
                //trans = "translate(" + node.dx / 2 + "," + node.dy / 2 + ")";
                var transX = Math.round((node.dx - box.width * scale.scaleX) / 2);
                var transY = Math.round((node.dy - box.height * scale.scaleY) / 2);

                //console.log("Node-label: " + node.name + ", transX = " + transX + ", transY = " + transY + ", scaleX = " + scale.scaleX + ", scaleY = " + scale.scaleY);

                trans = "translate(" + transX + "," + transY + ")";
            }
                // Else if the element is a cell
            else {
                scale = self.getScale(node, zoomNode);
                trans = self.getTranslateString(node, zoomNode);
            }
            scaleString = ", scale(" + scale.scaleX + "," + scale.scaleY + ")";
            return trans + scaleString;
        }

        /*
        * Calculates translate property of a cell and returns it as a string.
        */
        self.getTranslateString = function (node, zoomNode) {
            self.xScale.domain([zoomNode.x, zoomNode.x + zoomNode.dx]);
            self.yScale.domain([zoomNode.y, zoomNode.y + zoomNode.dy]);
            var kx = self.width / zoomNode.dx, ky = self.height / zoomNode.dy, x = self.xScale, y = self.yScale, transX, transY, scale = { scaleX: 1, scaleY: 1 };
            var trans = "";

            //If the node is in the top level
            if (node.depth === 1) {
                var scale = self.getScale(node.parent, zoomNode);
                transX = Math.round(x(node.x));
                transY = Math.round(y(node.y));
                trans = "translate(" + transX + "," + transY + ")";
                //console.log("Node: " + node.name + ", transX = " + transX + ", transY = " + transY + ", scaleX = " + scale.scaleX + ", scaleY = " + scale.scaleY);

            }
            else {
                transX = Math.round(node.x - node.parent.x);
                transY = Math.round(node.y - node.parent.y);
                trans = "translate(" + transX + "," + transY + ")";
            }

            return trans;
        }

        /*
        * Calculates scale property values of a cell and returns it as an object.
        */
        self.getScale = function (node, zoomNode) {
            var a = "";
            var scale = "";
            var depth = node.depth;
            var zoomParent = zoomNode
            var scaleX = 1;
            var scaleY = 1;

            //If the node is in the top level
            if (node.depth === 1) {
                while (zoomParent.depth > 0) {
                    zoomParent = zoomParent.parent;
                    var b = "";
                }

                var scaleX = zoomParent.dx / zoomNode.dx;
                var scaleY = zoomParent.dy / zoomNode.dy;

                //console.log("Node: " + node.name + ", scaleX = " + scaleX + ", scaleY = " + scaleY + ", zoomParent = " + zoomParent.name + ", zoomNode = " + zoomNode.name);

                scale = ", scale(" + scaleX + "," + scaleY + ")";
            }

            return { scaleX: scaleX, scaleY: scaleY };

        }

        /*
        * Calculates the inverse of a cells parents total scale.
        */
        self.getInverseScaleParents = function (node, zoomNode) {
            var parentScale, scaleX = 1, scaleY = 1, parentNode;

            parentNode = node;

            while (parentNode.depth > 0) {
                parentNode = parentNode.parent;
                parentScale = self.getScale(parentNode, zoomNode);
                scaleX = scaleX * parentScale.scaleX;
                scaleY = scaleY * parentScale.scaleY;
                var b = "";
            }

            parentScale = self.getScale(node.parent, zoomNode);
            scaleX = 1 / scaleX;
            scaleY = 1 / scaleY;

            return { scaleX: scaleX, scaleY: scaleY };
        }



        /*
        * Checks if an element has a specified class.
        */
        self.hasClass = function (elem, className) {
            if (typeof elem !== "undefined" && d3.select(elem).classed(className)) {
                return true;
            }

            return false;

        }

        /*
        * Update the text and position of the tooltip.
        */
        self.updateToolTip = function (node, elem) {
            var coordinates = [0, 0], x = 0, y = 0;
            coordinates = d3.mouse(d3.select('body')[0][0]);
            x = coordinates[0];
            y = coordinates[1];
            self.tooltip.select('h3').text(node.label);
            self.tooltip.select('h6').text("Value: " + node.value);

            self.tooltip
            .style("display", "block")
            .style("left", x - 100 + "px")
            .style("top", y - 120 + "px");
        }


        /*
        * Replaces all occurences of a string in another string. Find can be a string or an array of strings.
        */
        self.replaceAll = function (find, replace, str) {
            var reg;
            if (Array.isArray(find)) {
                find.forEach(function (v) {
                    str = str.split(v).join(replace);
                });
            }
            else {
                str = str.split(find).join(replace);
            }
            return str;
        };

        /*
        * Returns the order class name.
        */
        self.getOrderClass = function (node) {
            var order, parentOrder = 1, orderOffset;
            if (typeof node.parent !== "undefined" && typeof node.parent.parent !== "undefined") {
                parentOrder = (node.parent.parent.children.length - node.parent.order) + 1;
                parentOrder = parentOrder % 10;
            }

            order = (node.parent.children.length - node.order);
            order = order % 10 + 1;
            orderOffset = ((parentOrder - 1) + (order - 1)) % 10 + 1;

            //console.log("getOrderClass(): parentOrder = " + parentOrder + ", order = " + order + ", orderOffset = " + orderOffset + ", node = " + node.name);

            //order = node.order;
            return "order_" + order;
        };


    };


    // Create a global object to be used in HTMLWidgets.widget initialize function
    if (typeof window.PmWidgets === "undefined") {
        window.PmWidgets = {}
    }
    if (typeof window.PmWidgets.TreeMap === "undefined") {
        window.PmWidgets.TreeMap = TreeMap
    }

    if (typeof String.prototype.commafy === "undefined") {
        String.prototype.commafy = function () {
            return this.replace(/(^|[^\w.])(\d{4,})/g, function ($0, $1, $2) {
                return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
            });
        };
    }
    if (typeof Number.prototype.commafy === "undefined") {
        Number.prototype.commafy = function () {
            return String(this).commafy();
        };
    }

})();