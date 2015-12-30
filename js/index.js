$(function() {

    var $canvas = $('#canvas');
    var canvas = $canvas[0];
    var context = canvas.getContext('2d');
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


    };
    canvasApp();

    $('input').change(canvasApp);

});
