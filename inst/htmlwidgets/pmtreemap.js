HTMLWidgets.widget({

  name: 'pmtreemap',

  type: 'output',

  initialize: function(el, width, height) {
    
    var a = d3.select(el)
    console.log("HTMLWidgets - initialize, width = " + width);
    var treeMap = new window.PmWidgets.TreeMap(el, width, height);
    
    return treeMap;


  },

  renderValue: function(el, x, instance) {

    //el.innerText = x.message;
    console.log("HTMLWidgets - renderValue");
    var data = JSON.parse(x.data);
    instance.renderValue(el, data);

  },

  resize: function(el, width, height, instance) {
      console.log("HTMLWidgets - resize");
      instance.renderValue(el, width, height);
  }

});
