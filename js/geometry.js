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
 *
 */
CanvasRenderingContext2D.prototype.drawPPPSequencePlaneExpand = function(P, v, sides, anticlockwise) {

    this.beginPath();

    if(sides.length < 3) throw EvalError('绘制三角形边边边序列平面展开图错误：参数不足，至少三条边');
    if(sides.length % 2 !== 1) throw EvalError('绘制三角形边边边序列平面展开图错误：参数数量错误，边数必须为奇数');

    var A = P, B = A.add(v.normalize().times(sides[0])), C;
    var a, b, c;

    this._moveTo(B);
    //this._lineTo(B);

    for(var i = 2; i < sides.length; i+=2) {
        a = sides[i-1]; b = sides[i];
        if(G.eq(a, 0)) C = B;
        else if(G.eq(b, 0)) C = A;
        else C = G.getTrianglePointByTwoPointAndSides(A, B, a, b, i%4==(anticlockwise?2:0));
        this._lineTo(C);
        this._lineTo(A);
        //this._moveTo(C);
        //console.log(C);
        B = A;
        A = C;
    }

    this.stroke();
    this.closePath();

};

/**
 * 二维平面点类
 * @param x
 * @param y
 * @param z
 * @constructor
 */
var Point = function(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
};

Point.prototype = {

    zero: function() { return G.zr(this.x) && G.zr(this.y) && G.zr(this.z); },
    length: function() { return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z); },
    inverse: function() { return G.P(-this.x, -this.y, -this.z); },
    add: function(B) { return G.P(this.x+B.x, this.y+B.y, this.z+B.z); },
    minus: function(B) { return G.P(this.x-B.x, this.y-B.y, this.z-B.z); },
    times: function(k) { return G.P(k*this.x, k*this.y, k*this.z); },
    divides: function(k) { return G.P(this.x/k, this.y/k, this.z/k); },
    mid: function(B) { return this.times(0.5).add(B.times(0.5)); },
    normalize: function() { return this.divides(this.length() || 1); },
    getVectorTo: function(B) { return B.minus(this).normalize(); },
    getVectorFrom: function(B) { return B.getVectorTo(this); },
    parallel: function(B) { return G.zr(A.cross(B).length()); },
    perpendicular: function(B) { return G.zr(A.dot(B)); },  // 判断垂直
    perpendiculate: function() { return G.P(-this.y, this.x, this.z); },  // 绕z轴逆时针转九十度
    distance: function(B) { return G.distance(this, B); },
    dot: function(B) { return this.x * B.x + this.y * B.y + this.z * B.z; },  // 内积
    cross: function(B) { return G.P(this.y*B.z-this.z*B.y, this.z*B.x-this.x*B.z, this.x*B.y-this.y*B.x); },  // 叉积

    // 二维运算
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
    bisector: function(B) { var M = this.mid(B); return PP2L(M, M.add(this.minus(B).perpendiculate()));  },  // 垂直平分线
    mirror: function(l) { return this.pedal(l).times(2).minus(this); },  // 镜像点
    pedal: function(l) {
        var k = l.eval(this)/G.P(l.a,l.b).length();
        return this.minus(G.P(l.a*k, l.b*k));
    },  // 垂足

    // 函数
    copy: function() { return G.P(this.x, this.y, this.z); },
    toString: function() { return 'G.P('+this.x+','+this.y+','+this.z+')'; }
};

/**
 * 直线类 ax+by+c=0，归一化使得 a^2+b^2=1，并且 a>0 或者 a=0, b=1
 * @param a
 * @param b
 * @param c
 * @constructor
 */
var Line = function(a, b, c) {
    this.a = a; this.b = b; this.c = c;
    // 初始化时自动归一化
    var k = G.P(this.a, this.b).length();
    if(G.zr(k)) this.a = this.b = this.c = NaN;
    else { this.a /= k; this.b /= k; this.c /= k; }
};

Line.prototype = {
    eval: function(P) { return this.a*P.x+this.b*P.y+this.c; },
    vectorTangent: function() { return this.vectorNormal().perpendiculate(); },  // 切向量（第一第二象限）
    vectorNormal: function() { return G.P(this.a, this.b); },  // 法向量（第一第四象限）
    distance: function(B) { return G.distance(this, B); },

    parallel: function(l) { return this.vectorNormal().parallel(l.vectorNormal()); },  // 判断直线平行
    perpendicular: function(l) { return this.vectorNormal().perpendicular(l.vectorNormal()); },  // 判断直线垂直

    intersect: function(x) { return G.intersect(this, x); },

    normalize: function() {  // 归一化
        var k = G.P(this.a, this.b).length();
        if(G.zr(k)) this.a = this.b = this.c = NaN;
        else { this.a /= k; this.b /= k; this.c /= k; }
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

    cross: function(x) { return G.cross(this, x); },
    intersect: function(x) { return G.intersect(this, x); },

    copy: function() { return G.C(this.O.copy(), this.c); },
    toString: function() { return 'G.C(G.P('+this.O.x+','+this.O.y+'),'+this.r+')'; }
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
    P: function(x, y, z) { return new Point(x||0, y||0, z||0); },

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

    /**
     * 根据三边边长判断是否能够构成三角形
     * @param a
     * @param b
     * @param c
     * @returns {boolean}
     */
    isTriangleValid: function(a, b, c) {
        if(G.le(a, 0) || G.le(b, 0) || G.le(c, 0)) return false;
        if(G.lt(a+b, c) || G.lt(a+c, b) || G.lt(b+c, a)) return false;
        return true;
    },

    /**
     * 断言三边边长能够构成三角形，如果不行抛错
     * @param a
     * @param b
     * @param c
     */
    assertTriangle: function(a, b, c) {
        if(!this.isTriangleValid(a, b, c)) {
            throw EvalError('三角形验证失败，三边边长无法构成三角形。');
        }
    },

    /**
     * 给出三角形的两个顶点以及其对边边长，求取第三个点坐标
     * @param A
     * @param B
     * @param a
     * @param b
     * @param anticlockwise
     * @returns {*}
     */
    getTrianglePointByTwoPointAndSides: function(A, B, a, b, anticlockwise) {
        G.assertTriangle(a, b, G.distance(A, B));
        var pts = G.intersect(G.C(A, b), G.C(B, a));
        var direction = B.minus(A).cross(pts[0].minus(A)).z < 0;
        if(direction && anticlockwise || !direction && !anticlockwise) return pts[0];
        return pts[1];
    },

    /**
     * 获得两个图形之间的距离
     * @param A
     * @param B
     * @returns {*}
     */
    distance: function(A, B) {
        // 点点距
        if(A instanceof Point && B instanceof Point) return A.minus(B).length();
        // 线线距
        if(A instanceof Line && B instanceof Line) {
            if(A.parallel(B)) return Math.abs(A.c-B.c)/G.P(A.a, A.b).length();
            return 0;
        }
        // 点线距
        if(A instanceof Line && B instanceof Point || A instanceof Point && B instanceof Line) {
            if(A instanceof Line) return Math.abs(A.eval(B))/G.P(A.a, A.b).length();
            else return Math.abs(B.eval(A))/G.P(B.a, B.b).length();
        }
        throw EvalError('只支持计算点点距、点线距和线线距');
    },

    /**
     * 判断两个图形是否相交或相切
     * @param A
     * @param B
     * @returns {boolean}
     */
    cross: function(A, B) {
        if(A instanceof Circle && B instanceof Circle) {
            return G.le(G.distance(A.O, B.O), A.r+B.r);
        } else if(A instanceof Circle && B instanceof Line || A instanceof Line && B instanceof Circle) {
            var l = A instanceof Line ? A : B;
            var C = A instanceof Circle ? A : B;
            return G.le(G.distance(l, C.O), C.r);
        } else if(A instanceof Line && B instanceof Line) {
            // TODO:
        }
        throw EvalError('只支持计算圆和直线或者圆和圆是否相交');
    },

    /**
     * 获取两个图形之间的交点
     * @param A
     * @param B
     */
    intersect: function(A, B) {
        if(A instanceof Circle && B instanceof Circle) {
            //console.log('intersect('+ A.toString()+','+ B.toString()+')');
            var c1 = A, c2 = B;
            var d = G.distance(c1.O, c2.O);
            var t = (c1.r*c1.r-c2.r*c2.r+d*d)/d/2;
            var O = c1.O.add(c1.O.getVectorTo(c2.O).times(t));
            //console.log('--- '+d+' - '+t+' - '+ O.toString());
            //console.log(PP2L(O, O.add(c1.O.minus(c2.O).perpendiculate())).toString());
            return G.intersect(c1, PP2L(O, O.add(c1.O.minus(c2.O).perpendiculate())));
        } else if(A instanceof Circle && B instanceof Line || A instanceof Line && B instanceof Circle) {
            var l = A instanceof Line ? A : B;
            var C = A instanceof Circle ? A : B;
            var d = G.distance(l, C.O);
            if(G.gt(d, C.r)) return [];  // 相离
            var M = C.O.pedal(l);
            if(G.eq(d, C.r)) return [M];  // 相切
            var w = Math.sqrt(C.r*C.r-d*d);
            var v = l.vectorTangent().times(w);
            if(l.eval(M.add(v.perpendiculate())) * l.eval(C.O) < 0) v = v.inverse();
            return [M.add(v), M.minus(v)];
        } else if(A instanceof Line && B instanceof Line) {
            var a = A, b = B;
            if(a.parallel(b)) throw EvalError('平行线没有交点');
            return G.P(
                (a.b*b.c-b.b*a.c)/(b.b*a.a-a.b*b.a),
                (a.a*b.c-b.a*a.c)/(b.a*a.b-a.a*b.b)
            );
        }
        throw EvalError('只支持计算圆和直线或者圆和圆是否相交');
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


