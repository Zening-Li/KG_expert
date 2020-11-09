let categories = [{
        name: "概念",
        symbol: "rect",
        symbolSize:50
    },{
        name: "关系",
        symbol: "circle",
        symbolSize:60
    },{
        name: "属性",
        symbol: "roundRect"
    }];

let option = {
    // 提示框的配置
    tooltip: {
        formatter: function (x) {
            return x.data.des;
        }
    },
    // 工具箱
    toolbox: {
        // 显示工具箱
        show: true,
        feature: {
            mark: {
                show: true
            },
            // 还原
            restore: {
                show: true
            },
            // 保存为图片
            saveAsImage: {
                show: true
            }
        }
    },
    color: [/*"#ca8622", "#F7C172"*/'#2f4554',"#f47920", "#749f83","#f05b72", "#426ab3"/*"#91c7ae", "#61a0a8"*/],
    legend: [
        {
            // selectedMode: 'single',
            data: categories.map(function (a) {
                return {name:a.name,icon:a.symbol}
            })
        }
    ],

    series: [
        {
            symbol: "rect",
            type: "graph", // 类型:关系图
            layout: "force", //图的布局，类型为力导图
            symbolSize: 40, // 调整节点的大小
            roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移,可以设置成 'scale' 或者 'move'。设置成 true 为都开启
            edgeSymbol: ["circle", "arrow"],
            edgeSymbolSize: [2, 10],
            edgeLabel: {
              normal: {
                show: true,
                formatter: function (x) {
                  return x.data.name;
                },
                textStyle: {
                  fontSize: 10
                }
              }
            },
            force: {
                edgeLength: [80, 100],
                repulsion : 300,//节点之间的斥力因子。支持数组表达斥力范围，值越大斥力越大。
                gravity : 0.05,//节点受到的向中心的引力因子。该值越大节点越往中心点靠拢。
                layoutAnimation : true
            },
            draggable: true,
            lineStyle: {
                normal: {
                    width: 2,
                    color: "#4b565b"
                }
            },
            label: {
                normal: {
                    show: true,
                    textStyle : { //标签的字体样式
                    }
                }
            },
            // 数据
            data: [],
            links: [],
            categories: categories
        }
    ],
    grid: {
        top: "10px",
        bottom: "10px",
        height: "10px",
        width: "10px"
    }
};

export {option}
