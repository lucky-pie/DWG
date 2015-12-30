$(function() {

    var $canvas = $('#canvas');
    var canvas = $canvas[0];
    var context = canvas.getContext('2d'); window.ctx = context;
    var $form = $('form');

    var item = { d1: 0, d2: 0, l1: 0, r1: 0, r2: 0, h: 0, n: 0 };

    canvas.width = 1200;
    canvas.height = 800;

    var parseInput = function() {
        $.each(item, function(k, v) {
            item[k] = Number($form.find('[name="'+k+'"]').val());
        });
    };

    var canvasApp = function () {

        parseInput();

        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = '#000000';
        context.strokeStyle = '#000000';
        context.lineWidth = 1;

        // 平视图

        var A = G.P(50.5, 50.5);
        var B = A.add(G.P(item.d1/2+item.l1, 0));
        var C = B.add(G.P(0, item.h));
        var D = C.add(G.P(-item.d2/2, 0));
        var O = G.getCircleCenterByTwoPointsAndRadius(A, D, item.r1);

        context.beginPath();
        context._moveTo(A);
        context._lineTo(B);
        context._lineTo(C);
        context._lineTo(D);
        context._arc(O, D, A, true);
        context.stroke();
        context.closePath();

        // 俯视图

        var A1 = A.add(G.P(0, item.h+item.d1/2+50));
        var B1 = A1.add(G.P(item.d1/2+item.l1, 0));
        var C1 = B1.copy();
        var D1 = C1.add(G.P(-item.d2/2, 0));
        var E1 = B1.add(G.P(0, -item.d1/2));
        var F1 = B1.add(G.P(0, item.d1/2));
        var G1 = E1.add(G.P(-item.l1, 0));
        var H1 = F1.add(G.P(-item.l1, 0));
        var I1 = B1.add(G.P(0, -item.d2/2));
        var J1 = B1.add(G.P(0, item.d2/2));

        context.beginPath();
        context._moveTo(G1);
        context._lineTo(E1);
        context._lineTo(F1);
        context._lineTo(H1);
        context._arc(G1.mid(H1), H1, G1);
        context.stroke();
        context.closePath();

        context.setLineDash([3, 2]);

        context.beginPath();
        context._moveTo(J1);
        context._arc(B1, J1, I1);
        context.stroke();
        context.closePath();

        // 侧视图

        var A2 = A.add(G.P(item.d1+item.l1+50, 0));
        var E2 = A2.add(G.P(-item.d1/2, 0));
        var F2 = A2.add(G.P(item.d1/2, 0));
        var D2 = A2.add(G.P(0, item.h));
        var I2 = D2.add(G.P(-item.d2/2, 0));
        var J2 = D2.add(G.P(item.d2/2, 0));
        var P = G.getCircleCenterByTwoPointsAndRadius(E2, I2, item.r2);
        var Q = G.getCircleCenterByTwoPointsAndRadius(J2, F2, item.r2);

        context.setLineDash([]);

        context.beginPath();
        context._moveTo(E2);
        context._arc(P, E2, I2);
        context._lineTo(J2);
        context._arc(Q, J2, F2);
        context._lineTo(E2);
        context.stroke();
        context.closePath();

        context.setLineDash([3, 2]);

        context.beginPath();
        context._moveTo(A2);
        context._lineTo(D2);
        context.stroke();
        context.closePath();

        // 分层切割

        var k, l, ww, rr, dd, step = item.h / item.n;
        var X, Y, Z, U, V, W1;
        var CO, CP, CQ;
        var PP = B.add(G.P(-item.l1, 0)), _PP;
        var XA1 = B1.add(G.P(-item.l1, -item.d1/2)), _XA1;
        var XB1 = B1.add(G.P(-item.l1, item.d1/2)), _XB1;
        CO = G.C(O, item.r1);
        CP = G.C(P, item.r2);
        CQ = G.C(Q, item.r2);
        var colors = ['black', 'red', 'blue', 'green', 'gray', 'purple'];
        for(k = 1; k < item.n; ++k) {

            context.strokeStyle = colors[k];

            X = B.add(G.P(0, step * k));
            l = PP2L(X, X.add(G.P(1, 0)));
            Y = CO.intersect(l)[0];

            // 平视图截面半长轴距
            ww = G.distance(X, Y);

            // 平视图绘制
            context.beginPath();
            context.setLineDash([3, 2]);
            context._moveTo(X);
            context._lineTo(Y);
            context.stroke();
            context.closePath();

            Z = A2.add(G.P(0, step * k));
            U = CP.intersect(l)[0];
            V = CQ.intersect(l)[1];

            // 侧视图半径
            rr = G.distance(Z, U);

            // 平视图直线段长度
            dd = ww - rr;

            // 侧视图绘制
            context.beginPath();
            context.setLineDash([3, 2]);
            context._moveTo(U);
            context._lineTo(V);
            context.stroke();
            context.closePath();

            W1 = B1.add(G.P(-dd, 0));
            _XA1 = W1.add(G.P(0, -rr));
            _XB1 = W1.add(G.P(0, rr));


            context.beginPath();
            context.setLineDash([3, 2]);
            context._moveTo(_XB1);
            context._arc(W1, _XB1, _XA1);
            context.stroke();
            context.closePath();






            _PP = X.add(G.P(-dd, 0));

            context.strokeStyle = colors[0];

            // 侧视图引导线
            context.beginPath();
            context.setLineDash([]);
            context._moveTo(PP);
            context._lineTo(_PP);
            context.stroke();
            context.closePath();

            PP = _PP;

            // 俯视图引导线
            context.beginPath();
            context.setLineDash([3, 2]);
            context._moveTo(XA1);
            context._lineTo(_XA1);
            context._moveTo(XB1);
            context._lineTo(_XB1);
            context.stroke();
            context.closePath();

            XA1 = _XA1;
            XB1 = _XB1;

        }

        _XA1 = B1.add(G.P(0, -item.d2/2));
        _XB1 = B1.add(G.P(0, item.d2/2));

        // 俯视图引导线最后一截
        context.beginPath();
        context.setLineDash([3, 2]);
        context._moveTo(XA1);
        context._lineTo(_XA1);
        context._moveTo(XB1);
        context._lineTo(_XB1);
        context.stroke();
        context.closePath();


        // 平视图引导线最后一截
        context.beginPath();
        context.setLineDash([]);
        context._moveTo(PP);
        context._lineTo(C);
        context.stroke();
        context.closePath();





    };
    canvasApp();

    $('input').change(canvasApp);

});
