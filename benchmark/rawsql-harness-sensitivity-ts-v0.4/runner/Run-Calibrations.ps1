$ErrorActionPreference='Stop'
$root=Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$cal=Join-Path $root 'calibration';$fixture=Join-Path $root 'fixture'
$cases=@(@('CAL01','S01','PASS'),@('CAL02','S01','PASS'),@('CAL03','S01','FAIL'),@('CAL04','S01','FAIL'),@('CAL05','S01','PASS'),@('CAL06','S02','FAIL'),@('CAL07','S02','FAIL'),@('CAL08','S02','PASS'),@('CAL09','S02','FAIL'),@('CAL10','S01','FAIL'),@('CAL11','S01','FAIL'))
$out=@();$port=58000
foreach($case in $cases){
 $id,$task,$expect=$case;$path=Join-Path $cal $id
 if(Test-Path $path){Remove-Item -LiteralPath $path -Recurse -Force}
 Copy-Item -LiteralPath $fixture -Destination $path -Recurse
 Copy-Item -LiteralPath (Join-Path $cal "correct-$($task.ToLower()).ts") -Destination (Join-Path $path 'src/server.ts') -Force
 $source=Join-Path $path 'src/server.ts'
 if($id-eq'CAL03'){(Get-Content -Raw $source).Replace('count(*)::int','count(*)').Replace('coalesce(sum(quantity),0)::int','coalesce(sum(quantity),0)')|Set-Content $source}
 if($id-eq'CAL04'){(Get-Content -Raw $source).Replace('coalesce(sum(quantity),0)::int','sum(quantity)::int')|Set-Content $source}
 if($id-eq'CAL06'){(Get-Content -Raw $source).Replace('for update','').Replace('on conflict (request_id) do nothing returning request_id','on conflict (request_id) do update set quantity=excluded.quantity returning request_id')|Set-Content $source}
 if($id-in@('CAL07','CAL09')){(Get-Content -Raw $source).Replace('for update','').Replace('quantity=quantity-$1','quantity=greatest(quantity-$1,0)')|Set-Content $source}
 if($id-eq'CAL10'){(Get-Content -Raw $source).Replace("app.listen(Number(process.env.PORT??3000));","throw new Error('missing published SQL asset');")|Set-Content $source}
 if($id-ne'CAL11'){npm ci --ignore-scripts --silent --prefix $path;if($LASTEXITCODE-ne0){throw "$id npm ci"};npm run build --silent --prefix $path;if($LASTEXITCODE-ne0){throw "$id build"}}
 $result=Join-Path $cal "$id-result.json"; & $PSScriptRoot\Evaluate.ps1 -Task $task -CandidatePath $path -PostgresPort $port -ApplicationPort ($port+100) -OutputPath $result 2>&1|Tee-Object (Join-Path $cal "$id.log")
 $actual=(Get-Content -Raw $result|ConvertFrom-Json).primary;$out+=[ordered]@{id=$id;expected=$expect;actual=$actual;matchesExpected=($expect-eq$actual)};$port+=50
}
$summary=[ordered]@{result=if($out.matchesExpected-notcontains$false){'PASS'}else{'FAIL'};cases=$out};$summary|ConvertTo-Json -Depth 6|Set-Content (Join-Path $cal 'CALIBRATION-SUMMARY.json');if($summary.result-ne'PASS'){exit 1}
