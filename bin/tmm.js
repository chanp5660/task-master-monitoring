#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 패키지 루트 디렉토리 찾기
const packageRoot = path.dirname(__dirname);

// 도움말 메시지
function showHelp() {
  console.log(`
Task Master Monitoring (tmm) - Project Dashboard Tool

사용법:
  task-master-monitoring [옵션]
  tmm [옵션]

옵션:
  -p, --port <포트>    서버 포트 설정 (기본값: 3001)
  -h, --help          도움말 표시
  -v, --version       버전 정보 표시

예시:
  tmm                 # 기본 포트(3001)로 서버 시작
  tmm --port 4000     # 포트 4000으로 서버 시작
  tmm --help          # 도움말 표시

서버 시작 후 브라우저에서 http://localhost:3000 으로 접속하세요.
`);
}

// 버전 정보 표시
function showVersion() {
  const packageJson = require(path.join(packageRoot, 'package.json'));
  console.log(`Task Master Monitoring v${packageJson.version}`);
}

// 인자 파싱
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    port: 3001,
    help: false,
    version: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '-h' || arg === '--help') {
      options.help = true;
    } else if (arg === '-v' || arg === '--version') {
      options.version = true;
    } else if (arg === '-p' || arg === '--port') {
      const nextArg = args[i + 1];
      if (!nextArg || isNaN(nextArg)) {
        console.error('Error: --port 옵션에는 숫자를 입력해야 합니다.');
        process.exit(1);
      }
      options.port = parseInt(nextArg);
      i++; // 다음 인자 건너뛰기
    } else {
      console.error(`Error: 알 수 없는 옵션 '${arg}'`);
      console.error('도움말을 보려면 --help 옵션을 사용하세요.');
      process.exit(1);
    }
  }

  return options;
}

// 프로세스 실행 함수
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: packageRoot,
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// React 빌드 확인 및 생성
async function ensureBuild() {
  const buildPath = path.join(packageRoot, 'build');
  
  if (!fs.existsSync(buildPath)) {
    console.log('React 앱을 빌드하고 있습니다...');
    try {
      await runCommand('npm', ['run', 'build']);
      console.log('빌드가 완료되었습니다.');
    } catch (error) {
      console.error('빌드 중 오류가 발생했습니다:', error.message);
      process.exit(1);
    }
  }
}

// 서버 시작
async function startServer(port) {
  console.log(`Task Master Monitoring을 시작합니다...`);
  console.log(`서버 포트: ${port}`);
  console.log(`브라우저에서 http://localhost:${port} 로 접속하세요.`);
  console.log('');
  console.log('종료하려면 Ctrl+C를 누르세요.');
  console.log('');

  // 환경 변수 설정
  const env = {
    ...process.env,
    PORT: port.toString(),
    NODE_ENV: 'production'
  };

  // 빌드 확인
  await ensureBuild();

  try {
    // 글로벌 패키지에서는 항상 프로덕션 모드로 실행 (React는 빌드된 파일 서빙)
    await runCommand('npm', ['run', 'server'], { env });
  } catch (error) {
    console.error('서버 시작 중 오류가 발생했습니다:', error.message);
    process.exit(1);
  }
}

// 메인 함수
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  if (options.version) {
    showVersion();
    return;
  }

  // package.json 존재 확인
  const packageJsonPath = path.join(packageRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('Error: package.json 파일을 찾을 수 없습니다.');
    console.error(`경로: ${packageJsonPath}`);
    process.exit(1);
  }

  // 의존성 설치 확인
  const nodeModulesPath = path.join(packageRoot, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('의존성을 설치하고 있습니다...');
    try {
      await runCommand('npm', ['install']);
      console.log('의존성 설치가 완료되었습니다.');
    } catch (error) {
      console.error('의존성 설치 중 오류가 발생했습니다:', error.message);
      process.exit(1);
    }
  }

  // 서버 시작
  await startServer(options.port);
}

// 오류 처리
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// 실행
main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});