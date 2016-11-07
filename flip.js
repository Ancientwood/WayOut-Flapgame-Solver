$(document).ready(function(){

	var painterClass = $('.selector>.selected').attr('class').replace("selected","").trim();

	$('.selector').click(function(){
		$('.selector>.bdGrid').removeClass('selected');
		painterClass = $(this).children().attr('class');
		console.log(painterClass);
		$(this).children().addClass('selected');
	});

	$('#mainBoard').on('click','.bdGrid',function(){
		$(this).removeClass().addClass(painterClass);
	});

	//重绘棋盘
	$('#boardDraw').click(function(e){

		var bdrow = $('#boardRow').val();
		var bdcol = $('#boardColumn').val();

		if (isNaN(bdrow) || isNaN(bdcol)) {
			$('.sizeInput').after('<p>数字不对</p>').next().css('color','red').addClass('warning');
			return;
		} else {$('.warning').remove();}

		var gwidth = Math.floor(Math.min(530/bdcol-2,60));
		var gheight = gwidth;

		$('.bdRow').remove();

		for (var i = 1; i <= bdrow; i++) {
			var thisRow = $('<div></div>').addClass('bdRow').attr('id',i);
			for (var j = 1; j <= bdcol; j++) {
				var thisGrid = $('<div></div>').addClass('bdGrid').attr('id',j);
				if (gwidth<60) {
					thisGrid.css('width',gwidth)
				}
				thisGrid.appendTo(thisRow);
			}
			thisRow.appendTo('#mainBoard');
		}
	});

	//开始计算
	$('#Go').click(function(){

		//初始赋值
		var bdrow = $('#mainBoard .bdRow').length;
		var bdcol = $('#mainBoard .bdGrid').length / bdrow; 
		var puzzle = new Array(bdrow);
		var solution = new Array(bdrow);
		var solved = 0;
		for (var i = 0; i <= bdrow-1; i++) {
			puzzle[i] = new Array(bdcol);
			solution[i] = new Array(bdcol);
		}
		$('#mainBoard .bdRow').each(function(){
			var x=$(this).attr('id');
			$(this).find('.bdGrid').each(function(){
				var y=$(this).attr('id');
				if ($(this).hasClass('wall')) {
					puzzle[x-1][y-1] = -1;
					solved --;
				} else if($(this).hasClass('on')) {
					puzzle[x-1][y-1] = 1;
				} else {
					puzzle[x-1][y-1] = 0;
				};
			});
		});
		for (var i = 0; i <bdrow; i++) {
			for (var j = 0; j <bdcol; j++) {
				solution[i][j] = 0;
			}
		}

		//函数定义
		function arrSum(arr) {
  			var sum = 0;
  			for (var i = 0; i < arr.length; i++) {
    			if (typeof arr[i] == 'object') sum += arrSum(arr[i]);
    			else sum += arr[i];
  				}
  			return sum;
		}


		function nextSol(arr) {
			console.log(arr);
			var ppp=arrSum(solution);
			console.log(ppp);
			var row = arr.length;
			var col = arr[0].length;
			var i = row-1, j = col-1;
			var swapped = 0;
			var count = 0;
			var before;
			while ( swapped == 0 ){
				if (arr[i][j] == 1) {
					count++;
					if (i ==0&&j==0 ) {return arr} else {
						if ( j>0 ) { j=j-1 } else { i=i-1; j=col-1};
						continue;
					};
				};
				if (arr[i][j] == 0) {
					if (i ==0&&j==0 ) {
						count++;
						for (var m = 0; m < col; m++) {
							for (var n = 0; n < col; n++) {
								if (count>0) {arr[m][n]=1} else {arr[m][n]=0};
								count--;
							};
						};
						return arr;
					} else {
						if (j>0) { before = arr[i][j-1]} else {before = arr[i-1][col-1]};
						if (before==1) {
							arr[i][j]=1;
							if (j>0) { arr[i][j-1] = 0 } else { arr[i-1][col-1] = 0};
							swapped = 1;
							return arr;
						};
						if (before==0) {
							if ( j>0 ) { j=j-1 } else { i=i-1; j=col-1};
							continue;
						};
					};
				};
			};
		};

		function runGaming(board, solut){
			var row = solut.length;
			var col = solut[0].length;
			for (var i = 0; i < row; i++) {
				for (var j = 0; j< col; j++) {
					if (board[i,j]!=-1) {
						board[i,j]=1-solut[i,j]
						if (i-1>=0){if (board[i-1,j]!=-1) {board[i-1,j]=1-solut[i-1,j]};};
						if (j-1>=0){if (board[i,j-1]!=-1) {board[i,j-1]=1-solut[i,j-1]};};
						if (i+1<=row){if (board[i+1,j]!=-1) {board[i+1,j]=1-solut[i+1,j]};};
						if (j+1<=col){if (board[i,j+1]!=-1) {board[i,j+1]=1-solut[i,j+1]};};
					};
				};
			};
			if (arrSum(board)==solved) { return true } else {return false}
		};

		//Go.
		var xcount=0;
		while (xcount < 30 && !runGaming(puzzle, solution)){
			var result= runGaming(puzzle,solution);
			console.log(result);
			solution = nextSol(solution);
			xcount++;
		};

	})

});
