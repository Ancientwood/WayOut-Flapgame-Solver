$(document).ready(function(){

	var painterClass = $('.selector>.selected').attr('class').replace("selected","").trim();

	$('.selector').click(function(){
		$('.selector>.bdGrid').removeClass('selected');
		painterClass = $(this).children().attr('class');
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

		$('#mainBoard .bdRow').remove();

		for (var i = 1; i <= bdrow; i++) {
			var thisRow = $('<div></div>').addClass('bdRow').attr('id',i);
			for (var j = 1; j <= bdcol; j++) {
				var thisGrid = $('<div></div>').addClass('bdGrid').attr('id',j);
				if (gwidth<60) {
					thisGrid.css('width',gwidth).css('height',gheight);
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
		//计算
		var arrSum = function (arr) {
  			var sum = 0;
  			for (var i = 0; i < arr.length; i++) {
    			if (typeof arr[i] == 'object') sum += arrSum(arr[i]);
    			else sum += arr[i];
  				}
  			return sum;
		}

		var nextSol = function (arr) {
			var arrx = arr.length -1;
			var arry = arr[0].length -1;
			var swapped = 0;
			var count = 0;
			var before = -1;
			while ( swapped == 0 ){
				if (arr[arrx][arry] == 1) {
					count++;
					if (arrx ==0&&arry==0 ) {return arr} else {
						if ( arry>0 ) { arry=arry-1 } else { arrx=arrx-1; arry=arr[0].length-1};
						continue;
					};
				};
				if (arr[arrx][arry] == 0) {
					if (arrx ==0&&arry==0 ) {
						count++;
						for (var m = 0; m < arr.length; m++) {
							for (var n = 0; n < arr[0].length; n++) {
								if (count>0) {arr[m][n] = 1} else {arr[m][n] = 0};
								count--;
							};
						};
						return arr;
					} else {
						if (arry>0) { before = arr[arrx][arry-1]} else {before = arr[arrx-1][arr[0].length-1]};
						if (before==1) {
							arr[arrx][arry]=1;
							if (arry>0) { arr[arrx][arry-1] = 0 } else { arr[arrx-1][arr[0].length-1] = 0};
							return arr;
						};
						if (before==0) {
							if ( arry>0 ) { arry=arry-1 } else { arrx=arrx-1; arry=arr[0].length-1};
							continue;
						};
					};
				};
			};
		};

		var runGaming = function (board, solut){
			var solx = solut.length;
			var soly = solut[0].length;
			for (var i = 0; i < solx; i++) {
				for (var j = 0; j< soly; j++) {
					if (solut[i][j]==1) { //five grid flip
						if (board[i][j]!=-1) {
							board[i][j]=1-board[i][j];
							if (i>0) {if(board[i-1][j]!=-1){board[i-1][j]=1-board[i-1][j];};};
							if (j>0) {if(board[i][j-1]!=-1){board[i][j-1]=1-board[i][j-1];};};
							if (i<solx-1) {if(board[i+1][j]!=-1){board[i+1][j]=1-board[i+1][j];};};
							if (j<soly-1) {if(board[i][j+1]!=-1){board[i][j+1]=1-board[i][j+1];};};
						} else {return false};
					} else { continue };
				};
			};
			if (arrSum(board)==solved||arrSum(solut)==solx*soly) { return true } else {return false}
		};

		var a=[[1,0,0],[0,1,1]];
		var b=[[1,1,0],[0,0,0]];
		var c=[[1,0,0],[0,1,0]];

		var avb=runGaming(a,b);
		var avc=runGaming(a,c);

		console.log(a,b,c);
		console.log(avb);
		console.log(avc);

		/*
		
		do {
			solution=nextSol(solution);
		}while(!runGaming(puzzle,solution));

		//绘制解板
		var solrow = solution.length;
		var solcol = solution[0].length;
		var gwidth = Math.floor(Math.min(530/solcol-2,60));
		var gheight = gwidth;

		$('#solBoard .bdRow').remove();

		for (var i = 1; i <= solrow; i++) {
			var thisRow = $('<div></div>').addClass('bdRow').attr('id',i);
			for (var j = 1; j <= solcol; j++) {
				var thisGrid = $('<div></div>').addClass('bdGrid').attr('id',j);
				if (solution[i-1][j-1]==1) {thisGrid.addClass('click')};
				if (gwidth<60) {
					thisGrid.css('width',gwidth).css('height',gheight);
				}
				thisGrid.appendTo(thisRow);
			}
			thisRow.appendTo('#solBoard');
		}
		console.log(solution);
		*/
	});

});
