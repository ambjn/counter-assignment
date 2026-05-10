Pod::Spec.new do |s|
  s.name           = 'Counter'
  s.version        = '1.0.0'
  s.swift_version  = '5.9'
  s.summary        = 'Counter Expo Module'
  s.homepage       = 'n/a'
  s.license        = { :type => 'MIT' }
  s.author         = 'Amber'
  s.platform       = :ios, '15.1'
  s.source         = { :path => '..' }

  s.source_files = [
    'ios/*.{h,mm,swift}',
    'cpp/CounterStore.{h,cpp}',
  ]

  s.public_header_files = 'ios/CounterBridge.h'

  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'HEADER_SEARCH_PATHS' => '"$(PODS_TARGET_SRCROOT)/ios" "$(PODS_TARGET_SRCROOT)/cpp"',
  }

  s.dependency 'ExpoModulesCore'
  s.dependency 'React-Core'
end
