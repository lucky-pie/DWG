CanvasRenderingContext2D.prototype._moveTo = function(p) {
    this.moveTo(p.x, p.y);
};

CanvasRenderingContext2D.prototype._lineTo = function(p) {
    this.lineTo(p.x, p.y);
};

/**
 * 以 O 为圆心画出从 A 到 B 的圆弧
 * @param O
 * @param A
 * @param B
 * @param anticlockwise
 * @private
 */
CanvasRenderingContext2D.prototype._arc = function(O, A, B, anticlockwise) {
    anticlockwise = anticlockwise || false;
    this.arc(O.x, O.y, O.distance(A), A.minus(O).angle(), B.minus(O).angle(), anticlockwise);
};

/**
 * 二维平面点类
 * @param x
 * @param y
 * @constructor
 */
var Point = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

Point.prototype = {
    zero: function() { return G.zr(this.x) && G.zr(this.y); },
    inverse: function() { return G.P(-this.x, -this.y); },
    add: function(B) { return G.P(this.x+B.x, this.y+B.y); },
    minus: function(B) { return G.P(this.x-B.x, this.y-B.y); },
    times: function(k) { return G.P(k*this.x, k*this.y); },
    divides: function(k) { return G.P(this.x/k, this.y/k); },
    mid: function(B) { return this.times(0.5).add(B.times(0.5)); },
    length: function() { return Math.sqrt(this.x*this.x+this.y*this.y); },
    normalize: function() { return this.divides(this.length() || 1); },
    getVectorTo: function(B) { return B.minus(this).normalize(); },
    getVectorFrom: function(B) { return B.getVectorTo(this); },
    parallel: function(B) { return G.zr(A.cross(B)); },
    perpendicular: function(B) { return G.zr(A.dot(B)); },  // 判断垂直
    perpendiculate: function() { return G.P(-this.y, this.x); },  // 逆时针转九十度
    distance: function(B) { return G.distance(this, B); },
    angle: function() {
        var r = this.length();
        if(G.zr(r)) return NaN;
        if(this.y == 0) { return this.x > 0 ? 0 : Math.PI; }
        else if(this.y > 0) { return Math.acos(this.x/r); }
        else { return 2 * Math.PI - Math.acos(this.x/r); }
    },  // 向量弧度
    angleRadian: function() { return this.angle(); },  // 向量弧度，同 angle()
    angleDegree: function() { return this.angle()/Math.PI*180; },  // 向量角度
    rotate: function(angle) { /*TODO:*/ },  // 按角度旋转
    dot: function(B) { return this.x * B.x + this.y * B.y; },  // 内积
    cross: function(B) { return this.x * B.y - this.y * B.x; },  // 叉积
    bisector: function(B) { var M = this.mid(B); return PP2L(M, M.add(this.minus(B).perpendiculate()));  },  // 垂直平分线
    mirror: function(l) { return this.pedal(l).times(2).minus(this); },  // 镜像点
    pedal: function(l) { var k = l.eval(this)/G.P(l.a,l.b).length(); return this.minus(G.P(l.a*k, l.b*k)); },  // 垂足

    copy: function() { return G.P(this.x, this.y); },
    toString: function() { return 'G.P('+this.x+','+this.y+')'; }
};

/**
 * 直线类 ax+by+c=0，归一化使得 a^2+b^2=1，并且 a>0 或者 a=0, b=1
 * @param a
 * @param b
 * @param c
 * @constructor
 */
var Line = function(a, b, c) {
    var k = G.P(a, b).length();
    if(G.zr(k)) this.a = this.b = this.c = NaN;
    else {
        // 归一化
        this.a = a / k;
        this.b = b / k;
        this.c = c / k;
    }
};

Line.prototype = {
    eval: function(P) { return this.a*P.x+this.b*P.y+this.c; },
    vectorTangent: function() { return this.vectorTangent().perpendiculate(); },  // 切向量（第一第二象限）
    vectorNormal: function() { return G.P(-this.a, -this.b); },  // 法向量（第一第四象限）
    distance: function(B) { return G.distance(this, B); },

    parrallel: function(l) { return this.vectorNormal().parallel(l.vectorNormal()); },  // 判断直线平行
    perpendicular: function(l) { return this.vectorNormal().perpendicular(l.vectorNormal()); },  // 判断直线垂直

    intersect: function(l) {
        if(this.parrallel(l)) throw EvalError('平行线没有交点');
        return G.P(
            (a.b*b.c-b.b*a.c)/(b.b*a.a-a.b*b.a),
            (a.a*b.c-b.a*a.c)/(b.a*a.b-a.a*b.b)
        );
    },

    copy: function() { return G.L(this.a, this.b, this.c); },
    toString: function() { return 'G.L('+this.a+','+this.b+','+this.c+')'; }
};

/**
 * 两点式构造直线
 * @param A
 * @param B
 * @returns {Line}
 * @constructor
 */
var PP2L = function(A, B) {
    var v = A.getVectorFrom(B).perpendiculate();
    if(v.zero()) return G.L(NaN, NaN, NaN);  // 点重合
    if(v.x < 0) v = v.inverse();
    return new Line(v.x, v.y, -A.x*v.x-A.y* v.y);
};

var PK2L = function(P, k) {
    // TODO: 点斜式
};

var KB2L = function(k, b) {
    // TODO: 斜截式
};

var AB2L = function(a, b) {
    // TODO: 截距式
};


/**
 * 圆形类
 * @param O {Point}: 圆心
 * @param r {Number}: 半径
 * @constructor
 */
var Circle = function(O, r) {
    this.O = O.copy();
    this.r = r;
};
Circle.prototype = {

    intersect: function(l) {
        var d = l.distance(this.O);
        if(G.gt(d, this.r)) return [];  // 相离
        var M = this.O.pedal(l);
        if(G.eq(d, this.r)) return [M];  // 相切
        var w = Math.sqrt(this.r*this.r-d*d);
        var v = M.getVectorFrom(this.O).perpendiculate().times(w);
        return [M.add(v), M.minus(v)];
    },

    copy: function() { return C(this.a, this.b, this.c); },
    toString: function() { return 'G.L('+this.a+','+this.b+','+this.c+')'; }
};

/**
 * 几何工具库
 * @type {{getCircleCenterByTwoPointsAndRadius: Geometry.getCircleCenterByTwoPointsAndRadius}}
 */
var Geometry = {

    eps: 1e-10,  // 浮点误差

    zr: function(x) { return Math.abs(x) < this.eps; },  // 为零
    nz: function(x) { return Math.abs(x) > this.eps; },  // 非零
    eq: function(x, y) { return this.zr(x-y); },  // 相等
    ne: function(x, y) { return this.nz(x-y); },  // 不相等
    gt: function(x, y) { return x-y > this.eps; },  // 大于
    ge: function(x, y) { return x-y > -this.eps; },  // 大于等于
    lt: function(x, y) { return y-x > this.eps; },  // 小于
    le: function(x, y) { return y-x > -this.eps; },  // 小于等于

    /**
     * 平面点构造函数
     * @param x {Number}: x坐标
     * @param y {Number}: y坐标
     * @returns {Point}: 构造出来的点对象
     * @constructor
     */
    P: function(x, y) { return new Point(x||0, y||0); },

    /**
     * 圆构造函数
     * @param O {Point}: 圆心
     * @param r {Number}: 半径
     * @returns {Circle}
     * @constructor
     */
    C: function(O, r) { return new Circle(O, r); },

    /**
     * 直线构造函数
     * @param a
     * @param b
     * @param c
     * @returns {Line}
     * @constructor
     */
    L: function(a, b, c) { return new Line(a, b, c); },

    distance: function(A, B) {
        // 点点距
        if(A instanceof Point && B instanceof Point) return A.minus(B).length();
        // 线线距
        if(A instanceof Line && B instanceof Line) {
            if(A.parrallel(B)) return Math.abs(A.c-B.c)/G.P(A.a, A.b).length();
            return 0;
        }
        // 点线距
        if(A instanceof Line && B instanceof Point || A instanceof Point && B instanceof Line) {
            if(A instanceof Line) return Math.abs(A.eval(B))/G.P(A.a, A.b).length();
            else return Math.abs(B.eval(A))/G.P(B.a, B.b).length();
        }
        // TODO: 其他情况不予计算
        throw TypeError('不支持计算'+A.toString()+'和'+B.toString()+'之间的距离');
    },

    /**
     * 给出两个点以及半径，求经过 AB 的圆的圆心
     * 圆心在向量 A->B 的左边（逆时针方向）
     */
    getCircleCenterByTwoPointsAndRadius: function(A, B, r) {
        var M = A.mid(B);
        var d = A.minus(M).length();
        var l = Math.sqrt(r*r-d*d);
        return M.add(A.getVectorTo(B).perpendiculate().times(l));
    }

}, G = Geometry;


