$(document).ready(function(){

	//编辑棋盘
	$('.selector').click(function(){
		$('.bdGrid').removeClass('selected');
		$(this).children().addClass('selected');
	});

	$('#mainBoard').on('click','.bdGrid',function(){

		var switcher, painter;
		if ($('.selector .selected').parent().parent().hasClass('switchers')) {
			if ( $('.selector .selected').hasClass('on')){
				switcher = 1;
			} else { 
				switcher = 0;
			};
		} else {
			switcher = -1;
		};
		painter = $('.selector .selected').attr('class').replace('selected','').trim();

		if(switcher==1 && !$(this).hasClass('wall')){$(this).addClass('on');return;};
		if(switcher==0){$(this).removeClass('on');return;};
		if(switcher==-1){
			if( $(this).hasClass('on') && painter.indexOf("wall")==-1){
				$(this).removeClass().addClass(painter).addClass('on');
			} else {
				$(this).removeClass().addClass(painter);
			};
		};
	});

	//重绘棋盘
	$('#boardDraw').click(function(e){

		var bdrow = $('#boardRow').val();
		var bdcol = $('#boardColumn').val();

		if (isNaN(bdrow) || isNaN(bdcol)) {
			$('.sizeInput').after('<p>Wrong Number.</p>').next().css('color','red').addClass('warning');
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

	//Go.
	$('#Go').click(function(){

		var boardSize = $('#mainBoard .bdGrid').length;
		var bdrow = $('#mainBoard .bdRow').length;
		var bdcol = boardSize / bdrow;
		var puzzle = new Array(bdrow);
		var solution = new Array(bdrow);
		var walls = [], flipable=[], solstring = [];
		var solved = 0;
		for (var i = 0; i <= bdrow-1; i++) {
			puzzle[i] = new Array(bdcol);
			solution[i] = new Array(bdcol);
			for (var j = 0; j <= bdcol-1; j++) {
				puzzle[i][j] = {};
				solution[i][j] = 0;
			};
		};

		//棋盘读取
		$('#mainBoard .bdRow').each(function(){
			var x=$(this).attr('id')-1;
			$(this).find('.bdGrid').each(function(){
				var y=$(this).attr('id')-1;
				puzzle[x][y].gridtype = 'normal';
				if($(this).hasClass('on')) {
					puzzle[x][y].status = 1;
					solved += 1;
				} else {
					puzzle[x][y].status = 0;
				};

				if($(this).hasClass('wall')) {
					puzzle[x][y].gridtype = "wall";
					walls.push(x*bdcol+y+1);
				};
				if($(this).hasClass('vlink')) {
					puzzle[x][y].gridtype = "vlink";
				};
				if($(this).hasClass('hlink')) {
					puzzle[x][y].gridtype = "hlink";
				};
			});
		});
		for (var i = 1; i <= boardSize; i++) {
			if (walls.indexOf(i)==-1) {flipable.push(i)};
		}

		//预处理翻转关联
		for (var i = 0; i <= bdrow-1; i++) {
			for (var j = 0; j <= bdcol-1; j++) {
				var group = [];
				switch (puzzle[i][j].gridtype){
					case 'normal':
						group.push([i,j]);
						if ( i>0 ) {if (puzzle[i-1][j].gridtype !='wall'){group.push([i-1,j]);};};
						if ( j>0 ) {if (puzzle[i][j-1].gridtype !='wall'){group.push([i,j-1]);};};
						if ( i<bdrow-1 ) {if (puzzle[i+1][j].gridtype !='wall'){group.push([i+1,j]);};};
						if ( j<bdcol-1 ) {if (puzzle[i][j+1].gridtype !='wall'){group.push([i,j+1]);};};
					break;
					case 'vlink':
						group.push([i,j]);
						if ( i>0 ) {if (puzzle[i-1][j].gridtype !='wall'){group.push([i-1,j]);};};
						if ( i<bdrow-1 ) {if (puzzle[i+1][j].gridtype !='wall'){group.push([i+1,j]);};};
					break;
					case 'hlink':
						group.push([i,j]);
						if ( j>0 ) {if (puzzle[i][j-1].gridtype !='wall'){group.push([i,j-1]);};};
						if ( j<bdcol-1 ) {if (puzzle[i][j+1].gridtype !='wall'){group.push([i,j+1]);};};
					break;
					case 'wall':
						var wallArray = new Array(2);
						group.push(wallArray);
					break;
				};
				puzzle[i][j].group = group;
			};
		};

		var puzzleflat=JSON.stringify(puzzle);
		console.log(puzzleflat);

		//计算
		var nextSol = function(arr,max){
			if (arr.length>=max) {return false;};
			if (arr.length==0) {
				arr.push(1);
				return arr;
			};
			if (arr[arr.length-1]>=max) {
				arr.pop();
				var arr = nextSol(arr,max-1);
				arr.push(arr[arr.length-1]+1);
				return arr;
			};
			arr[arr.length-1]=arr[arr.length-1]+1;
			return arr;
		};

		var gaming = function (board,solstring,ons){
			var board = JSON.parse(JSON.stringify(puzzle));
			for (var i = 0; i <solstring.length; i++) {
				var s = flipable[solstring[i]-1];
				var x= Math.ceil(s / bdcol) - 1;
				var y= s - bdcol * x -1;
				console.log (s,x,y);
				console.log (bdrow,bdcol);
				board[x][y].group.forEach(function(e){
					if (board[e[0]][e[1]].status) {ons--}else{ons++};
					board[e[0]][e[1]].status = 1 - board[e[0]][e[1]].status
				});
			}
			var boardflat=JSON.stringify(board);
			return ons;
		}
		var solving = solved;
		while(solstring.length<flipable.length && solving > 0){
			nextSol(solstring,flipable.length);
			var solving = gaming(puzzle,solstring,solved);
		};

		$('#progress').text('按绿色格子依次点击 Click as the green grids show.')

		for (var i = solstring.length - 1; i >= 0; i--) {
			var s = flipable[solstring[i]-1];
			var x= Math.ceil(s / bdrow) - 1;
			var y= s - bdcol * x -1;
			solution[x][y] = 1;
		}

		var gwidth = Math.floor(Math.min(530/bdcol-2,60));
		var gheight = gwidth;

		$('#solBoard .bdRow').remove();

		for (var i = 1; i <= bdrow; i++) {
			var thisRow = $('<div></div>').addClass('bdRow').attr('id',i);
			for (var j = 1; j <= bdcol; j++) {
				var thisGrid = $('<div></div>').addClass('bdGrid').attr('id',j);
				if (solution[i-1][j-1]==1) {thisGrid.addClass('click')};
				if (gwidth<60) {
					thisGrid.css('width',gwidth).css('height',gheight);
				}
				thisGrid.appendTo(thisRow);
			}
			thisRow.appendTo('#solBoard');
		};
	});

});
